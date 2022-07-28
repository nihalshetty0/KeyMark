chrome.action.onClicked.addListener(listener);

function listener() {
  const foo = (storedData) => {
    if (storedData["optionsData"] == null) {
      chrome.storage.sync.set({
        optionsData: {
          activeOptions: ["reddit", "quora", "site:wikipedia.com"],
          passiveOptions: ["", ""],
        },
      });
    }
  };
  let getting = chrome.storage.sync.get(["optionsData"], foo);
  // chrome.tabs.create({
  //   url: chrome.runtime.getURL("settings/settings.html"),
  // });
}
