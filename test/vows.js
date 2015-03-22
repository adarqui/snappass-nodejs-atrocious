var
    snap = require('../snappass'),
    vows = require('vows'),
    assert = require('assert')
    ;

var app;
var key;

// for debugging.
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err.stack);
});

vows.describe('Tests').addBatch({
    'Setup': {
        topic: function() {
            app = new snap.SnapPass();
            return app;
        },
        'should be an instance of SnapPass': function(result) {
            assert.instanceOf(result, snap.SnapPass);
        },
    },
    // eh this is wrecked..
    'Init': {
        topic: function() {
            app.init('etc/config.json', this.callback);
        },
        'after init': {
            topic: function(err) {
                assert.equal(err, null);
                this.callback(err);
            },
            'error should be null': function(err) {
                assert.equal(err, null);
            },
            'key and password tests: set': {
                topic: function() {
                    app.set_password('foo', 'Day', this.callback);
                },
                'results': {
                    'should be 36 bytes in length': function(data) {
                        assert.equal(data.length, 36);
                        key = data;
                    },
                    'key and password tests: get': {
                        topic: function() {
                            app.get_password(key, this.callback);
                        },
                        'password should be returned by the previous key': function(err, data) {
                            assert.equal(err, null);
                            assert.equal(data, 'foo');
                        },
                        'retrieving the password again': {
                            topic: function() {
                                app.get_password(key, this.callback);
                            },
                            'password should have been deleted in the previous get_password call': function(err, data) {
                                assert.equal(err, null);
                                assert.equal(data, null);
                            },
                            'fini': function(err) {
                                app.fini();
                            },
                        },
                    },
                },
            },
        },
    },
    'WrapKey' : {
        topic: function() {
            return app.wrap_key('hello');
        },
        'should be snap:hello': function(key){
            assert.equal(key, 'snap:hello');
        }
    },
}).export(module);
