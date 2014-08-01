function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

Scraper.servives.ScrapTF = {

    loadBots: function (event) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('GET', 'http://scrap.tf/api/botdata/v1/botstatus', false);
        xmlHttp.send(null);
        var bots = JSON.parse(xmlHttp.responseText).bots,
            interestingBots = [];
        bots.forEach(function (bot) {
            if (bot.state === 5 && _.contains(event.botTypes, bot.type)) {
                interestingBots.push(bot);
            }
        });
        chrome.runtime.sendMessage({event: 'log', message: (interestingBots.length + ' bots online')});
        event.bots = interestingBots;
        event.event = 'botsLoaded';
        chrome.runtime.sendMessage(event);
    },

    scrapeBank: function (event) {
        var after = _.after(event.bots.length, function () {
            chrome.runtime.sendMessage({event: 'app/loadDone'});
        });
        shuffle(event.bots).forEach(function (bot) {
            var xmlHttp = new XMLHttpRequest(),
                html,
                items,
                botType = bot.type === 9 ? 'stranges' : 'hats';
            xmlHttp.open('GET', 'http://scrap.tf/' + botType + '/' + bot.id, true);
            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                    html = document.createElement('div');
                    html.innerHTML = xmlHttp.responseText;
                    var userName = html.querySelectorAll('.nav-username .group1')[0].textContent
                    if (!_.contains(Scraper._u, userName)) {
                        chrome.runtime.sendMessage({event: 'app/error', message: 'User is invalid or not logged in. Bot: ' + bot.name});
                        chrome.runtime.sendMessage({event: 'app/loadDone'});
                        return;
                    }
                    items = html.querySelectorAll('.item');
                    for (var i = 0; i < items.length; i++) {
                        var clazz = items[i].className,
                            quality = null,
                            craftable = false;
                        if (clazz.indexOf('quality6') > -1) quality = Item.Quality.UNIQUE;
                        if (clazz.indexOf('quality11') > -1) quality = Item.Quality.STRANGE;
                        if (clazz.indexOf('uncraft') === -1) craftable = true;
                        if (!quality || !craftable) continue;
                        var name = items[i].getAttribute('data-title').replace('&apos;', "'").replace('Strange ', ''),
                            marketPrice = event.prices[name][quality],
                            content = items[i].getAttribute('data-content'),
                            level = Number(content.match(/Level: (.*)\<br\/\>C/).pop()),
                            bankPrice = Number(content.match(/Costs: (.*)\ /).pop());
                        if (!_.isNaN(level) && _.contains(event.levels, level)) {
                            chrome.runtime.sendMessage({event: 'app/foundItem', message: {
                                name: name,
                                profit: marketPrice - bankPrice,
                                marketPrice: marketPrice,
                                bankPrice: bankPrice,
                                level: level,
                                bot: bot.name,
                                quality: quality
                            }});
                            console.log('LEVEL 100', {
                                name: name,
                                profit: marketPrice - bankPrice,
                                marketPrice: marketPrice,
                                bankPrice: bankPrice,
                                level: level,
                                bot: bot.name
                            });
                        }
                        if (marketPrice - bankPrice >= event.profit) {
                            chrome.runtime.sendMessage({event: 'app/foundItem', message: {
                                name: name,
                                profit: marketPrice - bankPrice,
                                marketPrice: marketPrice,
                                bankPrice: bankPrice,
                                level: level,
                                bot: bot.name,
                                quality: quality
                            }});
                            console.log({
                                name: name,
                                profit: marketPrice - bankPrice,
                                marketPrice: marketPrice,
                                bankPrice: bankPrice,
                                level: level,
                                bot: bot.name
                            });
                        }
                    }
                    after();
                    console.log('Bot ' + bot.name + ' done.');
                }
            };
            xmlHttp.onerror = function (error) {
                console.error('Error with bot', bot.name);
                console.error(error);
            }
            console.log('Starting ' + bot.name + "'s request");
            xmlHttp.send(null);
        });
    }

}