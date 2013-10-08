var helper = require('./helper');
var focusMgr = {};

var oldCellWithFocus, cellWithFocus;

focusMgr.init = function(wc) {
    this.wc = wc;
    oldCellWithFocus = null;
    cellWithFocus = null;
};

focusMgr.hasFocus = function() {
    return cellWithFocus !== null;
};

focusMgr.focusedCell = function() {
    return this.wc.datagrid.getCellAt(cellWithFocus.x, cellWithFocus.y);
};

focusMgr.right = function() {
    this.focusCell(this.wc.datagrid.getCellAt((cellWithFocus.x+1),(cellWithFocus.y)));
};

focusMgr.left = function() {
    this.focusCell(this.wc.datagrid.getCellAt((cellWithFocus.x-1),(cellWithFocus.y)));
};

focusMgr.up = function() {
    this.focusCell(this.wc.datagrid.getCellAt((cellWithFocus.x),(cellWithFocus.y-1)));
};

focusMgr.down = function() {
    this.focusCell(this.wc.datagrid.getCellAt((cellWithFocus.x),(cellWithFocus.y+1)));
};

// TODO : next{Right/Left/Up/Down} utilisés par {move/focus}{Right/Left/Up/Down}

focusMgr.focusCell = function(cell) {
    if(cell && helper.isCellEditable(cell)) {
        this.removeCellFocus();
        cellWithFocus = {
            x: cell.cellIndex,
            y: cell.cellRow
        };
        cell.setAttribute('focus', 'focus');
    }
};

focusMgr.refocusCell = function() {
    if(oldCellWithFocus) {
        this.focusCell(this.wc.datagrid.getCellAt(oldCellWithFocus.x, oldCellWithFocus.y));
    }
};

focusMgr.removeCellFocus = function() {
    if(cellWithFocus) {
        var domCellWithFocus = this.wc.datagrid.querySelector('[focus]');
        if (domCellWithFocus) {
            domCellWithFocus.removeAttribute('focus');
            oldCellWithFocus = cellWithFocus;
            cellWithFocus = null;
        }
    }
};

focusMgr.onContentRendered = function() {
    if(cellWithFocus) {
        this.focusCell(this.focusedCell());
    }
};

module.exports = focusMgr;