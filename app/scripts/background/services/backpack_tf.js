Scraper.servives.BackpackTF = {
    loadPrices: function (event) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('GET', 'http://backpack.tf/api/IGetPrices/v4/?key=53c3b1d04cd7b8a9238b4567&raw=enabled', false);
        xmlHttp.send(null);
        var reply = JSON.parse(xmlHttp.responseText).response;
        if (reply.message) {
            chrome.runtime.sendMessage({event: 'log', message: reply.message});
            chrome.storage.local.get('prices', function(data) {
                chrome.runtime.sendMessage({event: 'pricesLoaded', prices: data.prices, bots: event.bots, profit: event.profit});
            });
        } else {
            var editedPrices = {};
            for (var key in reply.items) {
                var item = reply.items[key],
                    typeKey;
                for (typeKey in Item.Quality) {
                    var type = Item.Quality[typeKey];
                    if (   item.prices[type]
                        && item.prices[type].Tradable
                        && item.prices[type].Tradable.Craftable
                        && item.prices[type].Tradable.Craftable[0]) {
                        var itemData = item.prices[type].Tradable.Craftable[0];
                        if (!editedPrices[key]) editedPrices[key] = {}
                        editedPrices[key][type] = itemData.value_raw;
                    }
                }
            }
            chrome.storage.local.set({prices: editedPrices}, function() {
                chrome.runtime.sendMessage({event: 'log', message: 'Added prices to storage'});
                chrome.runtime.sendMessage({event: 'pricesLoaded', prices: editedPrices, bots: event.bots, profit: event.profit});
            });
        }
    }
}