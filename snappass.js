'use strict';

var
    async = require('async'),
    express = require('express'),
    morgan = require('morgan'),
    redis = require('redis'),
    merge = require('merge'),
    uuid = require('uuid'),
    fs = require('fs')
    ;

var
    snap_config = require('./lib/config.js'),
    snap_time = require('./lib/time.js'),
    snap_proc = require('./lib/proc.js'),
    snap_ops = require('./lib/ops.js')
    ;

// Main entry point into snappass.
// Builds the config, connects to redis, and sets up the express web server.
var init = function(path, cb) {
    // Build the default config.
    var config = snap_config.defaultConfig();

    // state holds redis & express objects
    var state = {};

    // snap holds the merged config
    var snap = {};

    // acb = async cb
    async.series([
        function(acb) {
            fs.readFile(path, 'utf-8', function configurationReadAttempt(err, data) {
                snap_proc.exitIfTrue(err, 1);
                var js = JSON.parse(data);
                // Overwrite any specific fields specified in the user supplied config, via merge.
                snap = merge.recursive(true, config, js);
                acb(null, {});
            });
        },
        function(acb) {
            redis_connect(state, snap, function redisConnectionAttempt(err, data) {
                snap_proc.exitIfTrue(err, 1);
                acb(null, {});
            });
        },
        function(acb) {
            express_server(state, snap, function expressServerAttempt(err, data) {
                snap_proc.exitIfTrue(err, 1);
                acb(null, {});
            });
        },
    ],  function(err, results) {
            snap_proc.exitIfTrue(err, 1);
            cb(null, snap);
    });
    
};

// Connect to redis.
// Optionally (via config), connect to a specific database and/or authenticate using 'auth'.
var redis_connect = function(state, snap, cb) {
    state.redis = redis.createClient();
    state.redis.select(snap.redis.db, function redisSelectResult(err, data) {
        snap_proc.exitIfTrue(err, 1);
        if (snap.redis.auth.length > 0) {
            state.redis.auth(snap.redis.auth, function(err, data) {
                snap_proc.exitIfTrue(err, 1);
            });
        }
        cb(null, snap);
    });
};

// Setup the express server which will handle the GET/POST reqs and our static content.
var express_server = function(state, snap, cb) {
    state.web = express();
    // By default we shouldn't be logging.
    if (snap.web.logging === true) {
        state.web.use(morgan('combined'));
    }
    state.web.use('/static', express.static(snap.web.static));
    state.web.get('/', function indexRequest(req, res) {
        res.status(200).sendFile(__dirname + '/static/index.html');
    });
    // Attempt to GET a key.
    // If the key exists, return it and delete it.
    state.web.get('/:key', function keyRequest(req, res) {
        snap_ops.get_password(state, req.params.key, function(err, password) {
            if (err == null) {
                res.status(200).send(password);
            } else {
                res.status(400).send();
            }
        });
    });
    
    // Post a password and ttl expiration (day, week, month).
    // If successful, returns a v4 uuid.
    // This v4 uuid can be used to retrieve the original password stored in redis.
    // If ttl seconds pass, the password stored in redis will expire & disappear.
    state.web.post('/:password/:ttl', function passwordPostRequest(req, res) {
        var password = req.params.password;
        var ttl = snap_time.convert(req.params.ttl);
        if (ttl === 0) {
            return res.status(400).send();
        }
        snap_ops.set_password(state, password, ttl, function setPasswordStatus(err, key) {
            if (err == null) {
                res.status(200).send(key);
            } else {
                res.status(400).send();
            }
        });
    });
    state.web.server = state.web.listen(snap.web.port);
    cb(null, snap);
};

module.exports = {
    init: init
};
