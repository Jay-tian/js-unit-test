import demo4 from '../../src/demo4.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
const assert = require('chai').assert;
describe('asynchronous code', function() {
    let clock;
    before(function () { 
        utils.initJquery('<div id="demo4"></div>');
    });

    it('test by setTimeout', function(done) {
        let $demo = $('#demo4');
       
        demo4();
        assert.equal($demo.css('display'), 'none');
        let test = function() {
            assert.equal($demo.css('display'), 'block');
            done();
        };

        setTimeout(test, 1001);
    });

    it('test by sinon', function() {
        clock = sinon.useFakeTimers(); 
        let $demo = $('#demo4');
        assert.equal($demo.css('display'), 'block');
        demo4();
        assert.equal($demo.css('display'), 'none');
        clock.tick(101);
        assert.equal($demo.css('display'), 'none');
        clock.tick(900);
        assert.equal($demo.css('display'), 'block');
        clock.restore();
    });
});