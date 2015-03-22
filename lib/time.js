'use strict';

var time_conversion = {
    'week': 604800,
    'day': 86400,
    'hour': 3600
};

var convert = function(when) {
    var v = time_conversion[when.toLowerCase()];
    if (v != null) {
        return v;
    } else {
        return 0;
    }
};

module.exports = {
    convert: convert
};
