import post from '../../src/demo2.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
describe('demo2', function() {
    before(function() {
        utils.initJquery('');
    });
    
    it('jquery post', function() {
        let stubPost = sinon.stub($, 'post');
        let expectedUrl = '/demo2';
        let expectedParams = {'a': 'abc'};
        post();
        sinon.assert.calledWith(stubPost, expectedUrl, expectedParams);
        stubPost.restore();
    });
});