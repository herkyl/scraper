
var dom = {
    profit: document.getElementById('profit'),
    logs: document.getElementById('logs'),
    hats: document.getElementById('hats')
}

$('#search').click(search);

var levels;

function search() {
    $('.spinner').show();
    dom.logs.innerHTML = '';
    dom.hats.innerHTML = '';
    levels = $('#levels').val().split(",").map(function(x){return parseInt(x)});
    chrome.runtime.sendMessage({
        event: 'loadBots',
        profit: Number(dom.profit.value),
        levels: levels,
        botTypes: $('input:checkbox:checked').map(function() {
            return parseInt(this.value);
        }).get()
    });
}

var itemTemplate = _.template($('#item-template').html());

function addItem(request) {
    var item = request.message,
        $item = $(itemTemplate(item));
    $item.addClass('quality-' + item.quality);
    if (!_.isNaN(item.level) && _.contains(levels, item.level)) {
        $item.find('.level').html('Lv' + item.level);
    }
    $('#hats').append($item);
}

function addError(request) {
    $('#logs').append('<div class="error item">' + request.message + '</div>');
}


var router = {
    'app/foundItem': addItem,
    'app/loadDone': function () {$('.spinner').hide();},
    'app/error': addError
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.event && router[request.event]) router[request.event](request);
});
