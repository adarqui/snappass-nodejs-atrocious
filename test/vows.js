var
    vows = require('vows'),
    assert = require('assert')
    ;

vows.describe('Tests').addBatch({
    'Test' : {
        topic: function(){
            return 1;
        },
        'should be 1': function(doc){
            assert.equal(1, doc);
        }
    }
}).export(module);
