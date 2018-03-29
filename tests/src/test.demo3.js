import ajax from '../../src/demo3.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
describe('demo3', function() {
    before(function() {
        utils.initJquery('');
    });
    
    it('jquery ajax', function() {
        let stubAjax = sinon.stub($, 'ajax');
        let expectedParams = {
            type: 'GET',
            url: null,
            async: true,
            promise: true,
            dataType: 'json'
        };
        ajax();
        sinon.assert.calledWithMatch(stubAjax, expectedParams);
        stubAjax.restore();
    });
});