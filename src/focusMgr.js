var helper = require('./helper');
var focusMgr = {};

var oldCellWithFocus, cellWithFocus;

focusMgr._fixCoordinatesIfOutsideBounds = function(coords) {
    if(coords.x < this.wc._editableColumns[0]) {
        coords.y--;
        coords.x = this.wc._editableColumns[this.wc._editableColumns.length-1];
    } else if(coords.x > this.wc._editableColumns[this.wc._editableColumns.length-1]) {
        coords.y++;
        coords.x = this.wc._editableColumns[0];
    }
    return coords;
};

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
    this.focusCellAt(
        this._fixCoordinatesIfOutsideBounds({
            x: cellWithFocus.x+1,
            y: cellWithFocus.y
        })
    );
};

focusMgr.left = function() {
    this.focusCellAt(
        this._fixCoordinatesIfOutsideBounds({
            x: cellWithFocus.x-1,
            y: cellWithFocus.y
        })
    );
};

focusMgr.up = function() {
    this.focusCellAt(
        this._fixCoordinatesIfOutsideBounds({
            x:cellWithFocus.x,
            y:cellWithFocus.y-1
        })
    );
};

focusMgr.down = function() {
    this.focusCellAt(
        this._fixCoordinatesIfOutsideBounds({
            x:cellWithFocus.x,
            y:cellWithFocus.y+1
        })
    );
};

focusMgr.focusCellAt = function(coords) {
    this.focusCell(this.wc.datagrid.getCellAt(coords.x,coords.y));
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
        this.focusCellAt({
            x: oldCellWithFocus.x, 
            y: oldCellWithFocus.y
        });
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