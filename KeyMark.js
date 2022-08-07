const ON_INSTALL_PINS = ["reddit", "twitter", "site:wikipedia.com"];
const TOTAL_PINS = 5;
const LOCAL_STORE_KEY = "USERPINS";
const debug = false;

const getQueryParameter = (name, url) => {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(url);
  return results == null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
};

let activePins = ON_INSTALL_PINS;
let passivePins = Array(TOTAL_PINS - activePins.length).fill("");

const onStoredPinsFetched = (store) => {
  if (!store[LOCAL_STORE_KEY]) {
    chrome.storage.sync.set({
      [LOCAL_STORE_KEY]: { activePins, passivePins },
    });
  } else {
    activePins = store[LOCAL_STORE_KEY].activePins;
  }
};

chrome.storage.sync.get(LOCAL_STORE_KEY, onStoredPinsFetched);

let parser = new DOMParser();

setTimeout(() => {
  let keyword = getQueryParameter("q", window.location.href).trim();

  activePins.forEach((option) => {
    // remove option from option array
    if (keyword.toLowerCase().includes(option)) {
      activePins = activePins.filter((o) => o != option);
    }
    // removes option value from keyword, if any
    // keyword = keyword.replace(" " + option + " ", "");
  });

  let center_col = document.querySelector("#center_col");
  let extContainer = document.createElement("div");
  extContainer.classList.add("extContainer");

  //   rhs is right hand side info div (if there is any)
  let rhs = document.getElementById("rhs");

  // append extContainer to google body
  if (rhs !== null) {
    rhs.prepend(extContainer);
    // rhs.style.marginLeft = "882px";
    if (debug) console.log("rhs");
  } else {
    document.querySelector("#center_col").prepend(extContainer);
    center_col_style = getComputedStyle(center_col);
    extContainer.style.position = "absolute";
    extContainer.style.left =
      parseInt(center_col_style.width.replace("px", "")) + 50 + "px";
    // parseInt(center_col_style.marginLeft.replace("px", "")) +
  }

  // add activePins to extContainer
  let activePinTray = document.createElement("div");
  activePinTray.classList.add("activePinTray");
  // if (rhs) activePinTray.style.top = "6px";

  // construct activepin buttons
  activePins.forEach((option) => {
    let button = document.createElement("a");
    button.innerText =
      20 < option.length ? option.substring(0, 20) + "....." : option;
    button.classList.add("btn");

    button.setAttribute("id", option);
    button.onclick = () => {
      activePinTray.childNodes.forEach((o) => {
        o.classList.remove("btn-active");
      });
      button.classList.add("btn-active");
      fetchResult(keyword, option);
    };
    activePinTray.appendChild(button);
  });

  extContainer.prepend(activePinTray);

  // activePins.forEach((option) => {
  //   const optionBtn = document.getElementById(option);
  //   optionBtn.onclick = () => {
  //     activePinTray.childNodes.forEach((o) => {
  //       o.classList.remove("btn-active");
  //     });
  //     optionBtn.classList.add("btn-active");
  //     fetchResult(keyword, option);
  //   };
  // });

  const fetchResult = (keyword, option) => {
    let flag = 0;
    extContainer.childNodes.forEach((child) => {
      if (child.className != "activePinTray") child.style.display = "none";
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
  };

  const constructRightBody = (result, option) => {
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
      h1.textContent = "Nothing found here\n Maybe you are onto something";
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
  };
  activePinTray.childNodes[0].classList.add("btn-active");
  fetchResult(keyword, (option = activePins[0]));
}, 50);

function createSearchBtn(keyword, option) {
  let button = document.createElement("a");
  btnText = 25 < keyword.length ? keyword.substring(0, 25) + "..." : keyword;
  button.innerText = "Google: " + btnText + " " + option;
  button.href = "search?q=" + keyword.trim() + "+" + option;
  button.classList.add("btn");
  return button;
}
