'use strict';

var dom = {
    profit: document.getElementById('profit'),
    logs: document.getElementById('logs'),
    hats: document.getElementById('hats')
}

function keyPress(event) {
    if (event.keyCode == 13) {
        dom.logs.innerHTML = '';
        dom.hats.innerHTML = '';
        chrome.runtime.sendMessage({event: 'loadBots', profit: Number(dom.profit.value)});
        return false;
    }
}

dom.profit.onkeypress = keyPress;

var itemTemplate = _.template('<div> <%= name %> <span class="profit">(&#8593; <%= profit %>)</span> </div>');

function addItem(request) {
    var item = request.event.message,
        $item = $(itemTemplate(item));
    $item.addClass(item.quality);
    console.log($item[0]);
    $('#hats').append($item);
}


var router = {
    foundItem: addItem
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    window.alert(request);
    if (request.event && router[request.event]) {

        router[request.event](request);
    }
});