var router = {
    'loadBots': Scraper.servives.ScrapTF.loadBots,
    'botsLoaded': Scraper.servives.BackpackTF.loadPrices,
    'pricesLoaded': Scraper.servives.ScrapTF.scrapeBank,
    'log': function (event) {
        console.log(event.message);
    }
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.event && router[request.event]) router[request.event](request);
});