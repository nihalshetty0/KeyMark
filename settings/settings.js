const ON_INSTALL_PINS = ["reddit", "twitter", "site:wikipedia.com"];
const TOTAL_PINS = 5;
const LOCAL_STORE_KEY = "USERPINS";
let SUGGESTED_PINS = ["producthunt", "hackernews"];
let activePins = ON_INSTALL_PINS;
let passivePins = Array(TOTAL_PINS - activePins.length).fill("");

const savePinsToLocal = (e) => {
  if (e) e.preventDefault();
  let newActivePins = [];
  let newPassivePins = [];
  let emptyStringInPassive = [];

  const active = document.querySelector("#active");
  const activeElements = active.childNodes;
  // get user set preferrence from popup
  activeElements.forEach((ele) => {
    if (ele.value.trim() === "") emptyStringInPassive.push(ele.value);
    else newActivePins.push(ele.value);
  });

  // Array.prototype.move = function (from, to) {
  //   this.splice(to, 0, this.splice(from, 1)[0]);
  // };

  const passive = document.querySelector("#passive");
  let passiveElements = passive.childNodes;
  passiveElements.forEach((ele) => {
    if (ele.value.trim() === "") emptyStringInPassive.push("");
    else newPassivePins.push(ele.value);
  });
  newPassivePins = newPassivePins.concat(emptyStringInPassive);

  // passiveElements.move()

  chrome.storage.sync.set({
    [LOCAL_STORE_KEY]: {
      activePins: newActivePins,
      passivePins: newPassivePins,
    },
  });
  constructPopup({ activePins: newActivePins, passivePins: newPassivePins });
  const btn = document.querySelector("button");
  btn.innerText = "Saved";
  btn.style.backgroundColor = "#4CAF50";
  setTimeout(() => {
    btn.innerText = "Confirm";
    btn.style.backgroundColor = "#8ab4f8";
  }, 1500);
};

const onError = (error) => {
  console.log(`Error: ${error}`);
};
const onStoredPinsFetched = (store) => {
  if (!store[LOCAL_STORE_KEY]) {
    constructPopup({ activePins, passivePins });
  } else {
    constructPopup({ ...store[LOCAL_STORE_KEY] });
  }
  try {
  } catch (error) {
    onError(error);
  }
};

const restoreOptions = () => {
  chrome.storage.sync.get(LOCAL_STORE_KEY, onStoredPinsFetched);
};

function constructPopup({ activePins, passivePins }) {
  console.log(activePins, passivePins);
  const active = document.querySelector("#active");
  while (active.firstChild) {
    active.firstChild.remove();
  }

  constructPins(activePins, active);

  const suggested = document.getElementById("suggested");
  while (suggested.firstChild) {
    suggested.firstChild.remove();
  }
  let suggested_pins_filtered = SUGGESTED_PINS.filter(
    (eachPin) => !activePins.includes(eachPin)
  );
  console.log(SUGGESTED_PINS);
  suggested_pins_filtered = suggested_pins_filtered.filter(
    (eachPin) => !passivePins.includes(eachPin)
  );

  if (suggested_pins_filtered.length !== 0) {
    const suggestedTitle = document.createElement("div");
    suggestedTitle.classList.add("title", "chip");
    suggestedTitle.innerHTML = "Try:";
    suggested.append(suggestedTitle);
    console.log(SUGGESTED_PINS);

    suggested_pins_filtered.forEach((pin) => {
      const pinBtn = document.createElement("div");
      pinBtn.classList.add("chip");
      pinBtn.innerHTML = pin;
      pinBtn.addEventListener("click", () => {
        activePins.push(pin);
        passivePins.pop();
        constructPopup({ activePins, passivePins });
        savePinsToLocal();
      });
      suggested.append(pinBtn);
    });
  }

  const passive = document.querySelector("#passive");
  while (passive.firstChild) {
    passive.firstChild.remove();
  }
  constructPins(passivePins, passive);

  function constructPins(pinsArray, target) {
    pinsArray.forEach((eachPin) => {
      const input = document.createElement("input");
      input.classList.add("draggable");
      input.setAttribute("draggable", "true");
      input.setAttribute("maxlength", "50");
      input.setAttribute("placeholder", "Add website/keywords");
      input.addEventListener("dragstart", () => {
        input.classList.add("dragging");
      });

      input.addEventListener("dragend", () => {
        input.classList.remove("dragging");
      });
      input.value = eachPin;
      target.appendChild(input);
    });
  }
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
document.querySelector("form").addEventListener("submit", savePinsToLocal);
