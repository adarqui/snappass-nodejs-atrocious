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
    snap_proc = require('./lib/proc.js')
    ;

// Main entry point into snappass.
// Builds the config, connects to redis, and sets up the express web server.
var SnapPass = function() {

    var self = this;

    // state holds redis & express objects
    var state = {};

    // snap holds the merged config
    var snap = {};

    this.getSnap = function() {
        return snap;
    }

    this.init = function(path, cb) {
        // Build the default config.
        var config = snap_config.defaultConfig();

        // acb = async cb
        async.series([
            function(acb) {
                fs.readFile(path, 'utf-8', function configurationReadAttempt(err, data) {
                    var js = JSON.parse(data);
                    // Overwrite any specific fields specified in the user supplied config, via merge.
                    snap = merge.recursive(true, config, js);
                    acb(err, {});
                });
            },
            function(acb) {
                self.redis_connect(function redisConnectionAttempt(err, data) {
                    acb(err, {});
                });
            },
            function(acb) {
                self.express_server(function expressServerAttempt(err, data) {
                    acb(err, {});
                });
            },
        ],  function(err, results) {
                cb(err);
        });
        
    };

    // Close the express & Redis servers
    this.fini = function() {
        if (state.web !== undefined && state.web.server !== undefined) {
            state.web.server.close();
        }
        if (state.redis !== undefined) {
            state.redis.end();
        }
    }

    // Connect to redis.
    // Optionally (via config), connect to a specific database and/or authenticate using 'auth'.
    this.redis_connect = function(cb) {
        state.redis = redis.createClient();
        state.redis.select(snap.redis.db, function redisSelectResult(err, data) {
            snap_proc.exitIfTrue(err, 1);
            if (snap.redis.auth.length > 0) {
                state.redis.auth(snap.redis.auth, function(err, data) {
                    snap_proc.exitIfTrue(err, 1);
                });
            }
            cb(null);
        });
    };

    // Setup the express server which will handle the GET/POST reqs and our static content.
    this.express_server = function(cb) {
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
            self.get_password(req.params.key, function(err, password) {
                if (err == null && password != null) {
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
            self.set_password(password, ttl, function setPasswordStatus(err, key) {
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

    // wrap reddis keys like so: snap:<key>
    this.wrap_key = function(key) {
        return ('snap:'+key);
    };

    // Generates a key (uuid), sets the password for this key, then sets the expiration ttl on the key.
    this.set_password = function(password, ttl, cb) {
        var key = uuid.v4();
        state.redis.set(self.wrap_key(key), password, function redisSetKeyAndPassword(err, data) {
            snap_proc.exitIfTrue(err, 1);
            cb(err, key);
        });
        state.redis.expire(self.wrap_key(key), ttl, function(err,data) {});
    };

    // attempts to get the password stored for a given key
    // if the key is found, delete it from redis.
    this.get_password = function(key, cb) {
        state.redis.get(self.wrap_key(key), function redisGetPasswordFromKey(err, password) {
            if (err == null) {
                state.redis.del(self.wrap_key(key), function(err,data) {});
            }
            cb(err, password);
        });
    };

    return this;
};

module.exports = {
    SnapPass: SnapPass
};
