chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
        url: chrome.extension.getURL("app.html")
    });
});

Scraper = {
    servives: {}
};

Item = {
    Quality: {
        UNIQUE: 6,
        STRANGE: 11
    }
};