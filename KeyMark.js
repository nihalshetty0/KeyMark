// You saw what the best SEO had to say. Now read what common folks have to say.
function getParameterByName(name, url) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(url);
  return results == null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let options = ["reddit", "site:wikipedia.com", "quora"];
let empty = ["", ""];

let getting = browser.storage.sync.get(["optionsData"], onGot);
// getting.then(onGot);

function onGot(item) {
  if (item["optionsData"] == null) {
    // console.log("set");
    browser.storage.sync.set({
      optionsData: { activeOptions: options, passiveOptions: empty },
    });
  } else {
    options = item.optionsData["activeOptions"];
  }
}

// console.log(options);
let parser = new DOMParser();

setTimeout(() => {
  let keyword = getParameterByName("q", window.location.href).trim();

  options.forEach((option) => {
    // remove option from option array
    if (keyword.toLowerCase().includes(option)) {
      options = options.filter((o) => o != option);
    }
    // removes option value from keyword, if any
    keyword = keyword.replace(" " + option + " ", "");
  });

  let center_col = document.querySelector("#center_col");
  let extContainer = document.createElement("div");
  extContainer.classList.add("extContainer");

  //   rhs is right hand side info div (if there is any)
  let rhs = document.getElementById("rhs");

  // append extContainer to google body
  if (rhs !== null) {
    rhs.prepend(extContainer);
    rhs.style.marginLeft = "882px";
  } else {
    document.querySelector(".D6j0vc").prepend(extContainer);
    center_col_style = getComputedStyle(center_col);
    extContainer.style.position = "absolute";
    extContainer.style.left =
      parseInt(center_col_style.marginLeft.replace("px", "")) +
      parseInt(center_col_style.width.replace("px", "")) +
      50 +
      "px";
  }

  // add options to extContainer
  let optionArray = document.createElement("div");
  optionArray.classList.add("optionArray");
  // if (rhs) optionArray.style.top = "6px";

  options.forEach((option) => {
    let button = document.createElement("a");
    button.innerText =
      20 < option.length ? option.substring(0, 20) + "....." : option;
    button.classList.add("btn");

    button.setAttribute("id", option);
    optionArray.appendChild(button);
  });

  extContainer.prepend(optionArray);

  options.forEach((option) => {
    const optionBtn = document.getElementById(option);
    optionBtn.onclick = () => {
      optionArray.childNodes.forEach((o) => {
        o.classList.remove("btn-active");
      });
      optionBtn.classList.add("btn-active");
      fetchResult(keyword, option);
    };
  });

  function fetchResult(keyword, option) {
    let flag = 0;
    extContainer.childNodes.forEach((child) => {
      if (child.className != "optionArray") child.style.display = "none";
      if (child.className.includes(option.replace(/\s+/g, "-")) == true) {
        child.style.display = "block";
        flag = 1;
      }
    });
    if (flag == 1) {
      return;
    }

    // perform option not in extContainer
    if (!keyword.toLowerCase().includes(option)) {
      fetch("https://www.google.com/search?q=" + keyword + " " + option)
        .then((r) => r.text())
        .then((result) => {
          constructRightBody(result, option);
        });
    }
  }

  function constructRightBody(result, option) {
    extContainer.childNodes.forEach((child) => {
      if (child.className.includes(option.replace(/\s+/g, "-"))) {
        // console.log(child.className);
        return;
      }
    });
    let doc = parser.parseFromString(result, "text/html");
    // let newCenterCol = doc.quu
    search = doc.querySelector("#rso");

    // console.log(search.querySelectorAll(".g")[0].classList);
    if (search === null || search.querySelectorAll(".g").length === 0) {
      // extContainer.style.display = "none";
      const img = document.createElement("img");
      img.setAttribute("src", chrome.runtime.getURL("images/empty.svg"));
      const h1 = document.createElement("h1");
      const joke = [
        "Maybe you are onto something",
        // "Hmm... Maybe you are asking questions, you are not supposed to.",
      ];
      h1.textContent =
        "Nothing found here\n" + joke[Math.floor(Math.random() * joke.length)];

      const optionBody = document.createElement("div");

      optionBody.append(h1);
      h1.classList.add("joke");
      optionBody.append(img);
      optionBody.classList.add(
        "optionBody",
        "noResult",
        "option-" + option.replace(/\s+/g, "-")
      );
      // extContainer.classList.add("gXmnc s6JM6d eqAnXb");
      // extContainer.id
      extContainer.append(optionBody);
      return;
    }

    // console.log(search.children);
    // filter search result
    let searchChildren = search.children;
    // console.log(searchChildren);
    for (child in searchChildren) {
      let link = searchChildren[child];
      if (link.tagName === "DIV") {
        let iterate = 3;
        function findG(elementNode) {
          // console.log(element.classList);
          // console.log(elementNode, iterate);
          if (iterate === 0) return false;
          iterate = iterate - 1;
          if (elementNode.tagName !== "DIV") return;
          if (elementNode.classList.contains("g")) return true;
          if (elementNode.firstChild !== null)
            return findG(elementNode.childNodes[0]);
          else return false;
        }

        if (!findG(link)) link.style.display = "none";
      }
    }
    search.classList.add("optionBody", "option-" + option.replace(/\s+/g, "-"));
    const searchBtn = createSearchBtn(keyword, option);
    search.append(searchBtn);
    const topSearchBtn = searchBtn.cloneNode(true);
    topSearchBtn.classList.add("topSearchBtn");
    // search.prepend(topSearchBtn);
    extContainer.append(search);
  }
  optionArray.childNodes[0].classList.add("btn-active");
  fetchResult(keyword, (option = options[0]));
}, 50);

function createSearchBtn(keyword, option) {
  let button = document.createElement("a");
  btnText = 25 < keyword.length ? keyword.substring(0, 25) + "..." : keyword;
  button.innerText = "Google: " + btnText + " " + option;
  button.href = "search?q=" + keyword.trim() + "+" + option;
  button.classList.add("btn");
  return button;
}
