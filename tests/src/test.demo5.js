import demo5 from '../../src/demo5.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
const assert = require('chai').assert;

describe('demo5', function() {
    before(function () { 
        utils.initJquery('');
    });
    it('test', function() {
        assert.equal(demo5(), 1);
        const demo5require = require('../../src/demo5.require.js');
        let stub = sinon.stub(demo5require, 'a').returns('b');
        assert.equal(demo5(), 2);
        stub.restore();
    });
});