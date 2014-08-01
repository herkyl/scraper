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
    },
    BotType: {
        HAT: 2,
        STRANGE: 9
    }
};