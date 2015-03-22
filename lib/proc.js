'use strict';

var exit = function(err, code) {
    console.error(err);
    process.exit(code);
}

var exitIfTrue = function(err, code) {
    if (err === true) {
        exit(err, code);
    }
}

module.exports = {
    exit: exit,
    exitIfTrue: exitIfTrue
};
