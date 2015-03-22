var
    snap = require('../snappass'),
    vows = require('vows'),
    assert = require('assert')
    ;

var app;

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
            'fini': function(err) {
                assert.equal(err, null);
                app.fini();
            }
        }
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
