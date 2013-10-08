var focusMgr = require('./focusMgr');
var editMgr = require('./editMgr');

var KEYCODE = {
    "TAB": 9,
    "ENTER": 13,
    "ESC": 27,
    "F2": 113,
    "LEFT": 37,
    "UP": 38,
    "RIGHT": 39,
    "DOWN": 40
};

var keyboardListener = {};

keyboardListener.editionListener = function (e) {
    switch (e.keyCode) {
        case KEYCODE.ESC:
            editMgr.hide();
            focusMgr.refocusCell();
            break;
        case KEYCODE.ENTER:
            this.affectValue();
            editMgr.hide();
            focusMgr.refocusCell();
            break;
        case KEYCODE.TAB:
            if (!e.ctrlKey && !e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                this.affectValue();
                editMgr.hide();
                focusMgr.refocusCell();
                if (e.shiftKey) {
                    focusMgr.left();
                }
                else {
                    focusMgr.right();
                }
            }
            break;
    }
};

keyboardListener.focusListener = function(e) {
    if(focusMgr.hasFocus()) {
        switch(e.keyCode) {
        case KEYCODE.F2 :
            var cell = focusMgr.focusedCell();
            if (cell) {
                editMgr.edit(cell);
            }
            break;
        case KEYCODE.TAB :
            if (!e.ctrlKey && !e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                if (e.shiftKey) {
                    focusMgr.left();
                }
                else {
                    focusMgr.right();
                }
            }
            break;
        case KEYCODE.UP :
            e.preventDefault();
            focusMgr.up();
            break;
        case KEYCODE.DOWN :
            e.preventDefault();
            focusMgr.down();
            break;
        case KEYCODE.LEFT :
            e.preventDefault();
            focusMgr.left();
            break;
        case KEYCODE.RIGHT :
            e.preventDefault();
            focusMgr.right();
            break;
        }
    }
};

module.exports = keyboardListener;