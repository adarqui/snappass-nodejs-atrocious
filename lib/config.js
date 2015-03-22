'use strict';

var
    merge = require('merge')
    ;

var defaultConfig = function() {
    return {
        'debug': true,
        'redis': {
            'host': '127.0.0.1',
            'port': 6379,
            'db': 0,
            'auth': ''
        },
        'web': {
            'port': 5000,
            'static': __dirname + '/snappass-static',
            'logging': false
        }
    };
};

module.exports = {
    defaultConfig: defaultConfig
};
