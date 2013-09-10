(function(){  
    xtag.register('x-cell-editor', {
        lifecycle:{
            created: function(){
                // fired once at the time a component
                // is initially created or parsed
            },
            inserted: function(){
                // fired each time a component
                // is inserted into the DOM
            },
            removed: function(){
                // fired each time an element
                // is removed from DOM
            },
            attributeChanged: function(){
                // fired when attributes are set
            }
        },
        events: {
            // TODO
        },
        accessors: {
            // TODO
        },
        methods: {
            // TODO
        }
    });
})();
