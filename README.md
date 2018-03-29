# 使用 mocha 集成单元测试(上)

## 安装依赖
```
yarn add jquery mocha  mochawesome  istanbul  sinon chai jsdom decache babel-cli babel-core babel-preset-es2015 babel-plugin-module-resolver babel-istanbul  
```
mocha：测试框架
mochawesome：可视化报表
istanbul：覆盖率
sinon：替换依赖
chai：断言

## scripts 命令

命令
```
  "scripts": {
    "test": "mocha --timeout 5000 --recursive --reporter mochawesome --require babel-core/register tests/src && open mochawesome-report/mochawesome.html && npm run test:cover",
    "test:cover": "babel-node ./node_modules/.bin/babel-istanbul cover _mocha -- tests/src/* -R spec --recursive && open coverage/lcov-report/index.html",
    "test:s": "mocha --recursive --require babel-core/register  --timeout 5000"
  }
```
test 命令：执行单元测试，并打开测试报告页面和覆盖率页面
test:cover 执行生成单元测试覆盖率并打开
test:s 执行单个单元测试文件

### 参数解析
--timeout 5000 超时设置
--recursive 包含子目录
--reporter mochawesome 通过mochawesome生成报表
--require babel-core/register 通过babel转译es6语法
tests/src 单元测试目录路径
open mochawesome-report/mochawesome.html 打开页面

## 测试含有jQuery的代码

### 初始化Jquery环境

```
let { JSDOM } = require('jsdom');
let dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`,{
    url: 'http://127.0.0.1',
    referrer: 'http://127.0.0.1',
    contentType: 'text/html',
    userAgent: 'Mellblomenator/9000',
    includeNodeLocations: true,
});
global.window = dom.window;
global.$ = require('jquery');
```

### 测试click事件

```
const { demo1 } = require('../../src/demo1.js');
const assert = require('chai').assert;
describe('demo1', function() {
  it('jquery click test', function() {
    demo1($('body'));
    assert.equal($('body').hasClass('hide'), false);
    $('body').trigger('click');
    assert.equal($('body').hasClass('hide'), true);
  });
});
```

### 运行结果
以上测试了，点击元素时，给该元素添加一个‘hide’类的方法
模拟jquery环境和触发click事件

### 测试post事件
由于初始化jquery环境比较通用，我们把它放到工具类去引用
#### utils.js

```
const decache = require('decache');
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
    decache('jquery');
    global.$ = require('jquery');
}
```
因为node环境中，require会有缓存，导致不同的单元测试间的初始环境不一致，需要手动清除缓存

```
 decache('jquery');
```

#### test.demo2.js

```
import post from '../../src/demo2.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
require('./../utils');
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
```
restore()操作 将会复原被替换的对象
mocha 有四个钩子方法
before 在所有的单元测试运行前运行一次
after 在所有的单元测试运行结束运行一次
beforeEach 在每一个的单元测试运行前运行一次
afterEach 在每一个的单元测试运行后运行一次

### 测试ajax

#### demo3.js

```
export default function() {
    $.ajax({
    type: 'GET',
    url: null,
    async: true,
    promise: true,
    dataType: 'json',
    beforeSend(request) {
    }
  });
}
```

#### test.demo3.js
```
import ajax from '../../src/demo3.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
require('./../utils');
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
```
这里我们使用calledWithMatch断言参数，该方法可以断言传入的参数是否正确，不需要传入所有的参数

### 测试异步代码
#### demoe4.js

```
export default function() { 
    $('#demo4').hide();
    setTimeout(
        function(){
            $('#demo4').show();
        }, 1000);
}
```


```
import demo4 from '../../src/demo4.js'; 
const utils = require('./../utils');
const sinon = require('sinon');
const assert = require('chai').assert;
require('./../utils');
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
            // 这里的done告知这个单元测试结束了，保证不影响其他单元测试
            done();
        };

        setTimeout(test, 1001);
    });

    it('test by sinon', function() {
        //当利用了useFakeTimers后，事件将会停止
        clock = sinon.useFakeTimers(); 
        let $demo = $('#demo4');
        //运行demo4前，元素还是显示的
        assert.equal($demo.css('display'), 'block');
        demo4();
        //运行demo4完，元素隐藏了
        assert.equal($demo.css('display'), 'none');
        //时间穿梭101ms秒，定时器代码还未执行，所以元素还是隐藏的
        clock.tick(101);
        assert.equal($demo.css('display'), 'none');
        //时间再穿梭900ms秒，就到达了1001ms后，定时器代码执行了，所以元素现在显示了
        clock.tick(900);
        assert.equal($demo.css('display'), 'block');
        //恢复时间
        clock.restore();
    });
});
```
第一个单元测试利用了 setTimeout 去测试异步代码
第二个单元测试利用了 sinon 的时空穿梭器去测试异步代码

第一个单元测试花了1035ms
而第二个单元测试几乎没有花费多少时间

所以异步代码编写单元测试时，第二个单元测试写法更优

### 需要测试的代码包含其他负责业务逻辑时
#### demo5.js
```
const demo5require = require('./demo5.require.js');

export default function() { 
    if(demo5require.a() == 'a') {
        return 1;
    } else {
        return 2;
    }
}
```
#### test.demo5.js
```
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
```

此时demo5依赖其他模块，我们就可以替换demo5require的方法，并指定返回值，这样就不用关系依赖的模块做了什么业务。
测试结束，复原被替换的对象

### webpack环境编写单元测试
webpack中会有设置别名的情况，这样单元测试有可能引入的模块的路径有误，这里我们可以使用babel-plugin-module-resolver进行别名的替换

#### .babelrc
```
{
  "presets": ["es2015"],
  "plugins": [
    ["module-resolver", {
      "root": ["./"],
      "alias": {
         "common":""
      }
    }]
  ]
}
```

### 运行结果
执行命令

```
npm run test
```