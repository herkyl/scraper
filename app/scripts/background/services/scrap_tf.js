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
            if (bot.state === 5/*active*/ && (bot.type === 2/*hats*/ /*|| bot.type === 9/*stranges*/)) {
                interestingBots.push(bot);
            }
        });
        chrome.runtime.sendMessage({event: 'log', message: (interestingBots.length + ' bots online')});
        chrome.runtime.sendMessage({event: 'botsLoaded', bots: interestingBots, profit: event.profit});
    },

    scrapeBank: function (event) {
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
                        if (level === 100) {
                            chrome.runtime.sendMessage({event: 'foundItem', message: {
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
                            chrome.runtime.sendMessage({event: 'foundItem', message: {
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
                    console.log('Bot ' + bot.name + ' done.')
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