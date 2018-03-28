let { JSDOM } = require('jsdom');

exports.initJquery = function(html, params = {}){
    params = Object.assign({
        url: 'http://127.0.0.1',
        referrer: 'http://127.0.0.1',
        contentType: 'text/html',
        userAgent: 'Mellblomenator/9000',
        includeNodeLocations: true,
    }, params);
    let dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`, params);
    global.window = dom.window;
    global.$ = require('jquery');
}