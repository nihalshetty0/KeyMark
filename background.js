browser.browserAction.onClicked.addListener(listener);

function listener() {
  const foo = (storedData) => {
    if (storedData["optionsData"] == null) {
      browser.storage.sync.set({
        optionsData: {
          activeOptions: [
            "reddit",
            "site:wikipedia.com",
            "quora",
            "site:producthunt.com",
          ],
          passiveOptions: [""],
        },
      });
    }
  };
  let getting = browser.storage.sync.get(["optionsData"], foo);
  browser.tabs.create({
    url: browser.runtime.getURL("settings/settings.html"),
  });
}
