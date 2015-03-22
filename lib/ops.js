'use strict';

var
    express = require('express'),
    redis = require('redis'),
    uuid = require('uuid')
    ;

// Generates a key (uuid), sets the password for this key, then sets the expiration ttl on the key.
var set_password = function(state, password, ttl, cb) {
    var key = uuid.v4();
    state.redis.set(wrap_key(key), password, function(err,data) {
        cb(err, key);
    });
    state.redis.expire(wrap_key(key), ttl, function(err,data) {
    });
};

// attempts to get the password stored for a given key
// if the key is found, delete it from redis.
var get_password = function(state, key, cb) {
    state.redis.get(wrap_key(key), function(err, password) {
        if (err == null) {
            state.redis.del(wrap_key(key), function(err,data) {
            });
        }
        cb(err, password);
    });
};

// wrap reddis keys like so: snap:<key>
var wrap_key = function(key) {
    return ('snap:'+key);
};

module.exports = {
    set_password: set_password,
    get_password: get_password,
    wrap_key: wrap_key
};
