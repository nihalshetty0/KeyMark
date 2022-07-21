function saveOptions(e) {
  e.preventDefault();
  let activeOptions = [];
  let passiveOptions = [];
  const active = document.querySelector("#active");
  const activeElements = active.childNodes;
  activeElements.forEach((ele) => {
    if (ele.value.trim() == "") passiveOptions.push(ele.value);
    else activeOptions.push(ele.value);
  });

  const passive = document.querySelector("#passive");
  const passiveElements = passive.childNodes;
  passiveElements.forEach((ele) => {
    passiveOptions.push(ele.value);
  });

  const optionsData = {
    activeOptions,
    passiveOptions,
  };
  console.log(optionsData);
  chrome.storage.sync.set({
    optionsData,
  });
  setCurrentChoice({ optionsData: { activeOptions, passiveOptions } });
  const btn = document.querySelector("button");
  btn.innerText = "Saved";
  btn.style.backgroundColor = "#4CAF50";
  setTimeout(() => {
    btn.innerText = "Confirm";
    btn.style.backgroundColor = "#8ab4f8";
  }, 1500);
}

function restoreOptions() {
  function onError(error) {
    console.log(`Error: ${error}`);
  }

  const foo = (storedData) => {
    try {
      const defaultValue = {
        optionsData: {
          activeOptions: ["reddit", "quora", "site:wikipedia.com"],
          passiveOptions: ["", ""],
        },
      };
      if (storedData["optionsData"] == null) {
        setCurrentChoice(defaultValue);
      }
      setCurrentChoice(storedData);
    } catch (error) {
      onError(error);
    }
  };
  // onError;
  let getting = chrome.storage.sync.get(["optionsData"], foo);
}
function setCurrentChoice({ optionsData }) {
  const { activeOptions, passiveOptions } = optionsData;
  // const { activeOptions } = optionsData;
  const active = document.querySelector("#active");
  while (active.firstChild) {
    active.firstChild.remove();
  }
  activeOptions.forEach((o) => {
    const input = document.createElement("input");
    input.classList.add("draggable");
    input.setAttribute("draggable", "true");
    input.setAttribute("maxlength", "50");
    input.addEventListener("dragstart", () => {
      input.classList.add("dragging");
    });

    input.addEventListener("dragend", () => {
      input.classList.remove("dragging");
    });
    input.value = o;
    active.appendChild(input);
  });

  const passive = document.querySelector("#passive");
  while (passive.firstChild) {
    passive.firstChild.remove();
  }
  passiveOptions.forEach((o) => {
    const input = document.createElement("input");
    input.classList.add("draggable");
    input.setAttribute("draggable", "true");
    input.addEventListener("dragstart", () => {
      input.classList.add("dragging");
    });

    input.addEventListener("dragend", () => {
      input.classList.remove("dragging");
    });

    input.value = o;
    passive.appendChild(input);
  });
}

const containers = document.querySelectorAll(".container");

containers.forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
