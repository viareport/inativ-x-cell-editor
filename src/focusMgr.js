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
    this.focusCellAt(cellWithFocus.x+1,cellWithFocus.y);
};

focusMgr.left = function() {
    this.focusCellAt(cellWithFocus.x-1,cellWithFocus.y);
};

focusMgr.up = function() {
    this.focusCellAt(cellWithFocus.x,cellWithFocus.y-1);
};

focusMgr.down = function() {
    this.focusCellAt(cellWithFocus.x, cellWithFocus.y+1);
};

focusMgr.focusCellAt = function(x, y) {
    this.focusCell(this.wc.datagrid.getCellAt(x,y));
};

focusMgr.focusCell = function(cell) {
    if(!cell) {
        throw new Error("Can't focus undefined cell");
    }
    if(helper.isCellEditable(cell)) {
        this.removeCellFocus();
        cellWithFocus = {
            x: cell.cellIndex,
            y: cell.rowIndex
        };
        cell.setAttribute('focus', 'focus');
    }
};

focusMgr.refocusCell = function() {
    if(oldCellWithFocus) {
        this.focusCellAt(oldCellWithFocus.x, oldCellWithFocus.y);
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