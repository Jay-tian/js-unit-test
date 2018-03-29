
const { demo1 } = require('../../src/demo1.js');
const assert = require('chai').assert;
let { JSDOM } = require('jsdom');

describe('demo1', function() {
  before(function(){
    let dom = new JSDOM(`<!DOCTYPE html><html><body>asdf</body></html>`,{
        url: 'http://127.0.0.1',
        referrer: 'http://127.0.0.1',
        contentType: 'text/html',
        userAgent: 'Mellblomenator/9000',
        includeNodeLocations: true,
    });
    global.window = dom.window;
    global.$ = require('jquery');
  });

  it('jquery click test', function() {
    demo1($('body'));
    assert.equal($('body').hasClass('hide'), false);
    $('body').trigger('click');
    assert.equal($('body').hasClass('hide'), true);
  });
});