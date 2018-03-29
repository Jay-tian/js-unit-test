const demo5require = require('./demo5.require.js');

export default function() { 
    if(demo5require.a() == 'a') {
        return 1;
    } else {
        return 2;
    }
}