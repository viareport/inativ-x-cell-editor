var helper = require('./helper');

var oldCellWithFocus, cellWithFocus;
var focusMgr = {
    wc: null
};

function fixCoordinatesIfOutsideBounds(coords) {

    var xMin = focusMgr.wc._editableColumns[0];
    var xMax = focusMgr.wc._editableColumns[focusMgr.wc._editableColumns.length-1];

    if(coords.x < xMin) {
        coords.y--;
        coords.x = xMax;
    } else if(coords.x > xMax) {
        coords.y++;
        coords.x = xMin;
    }
    return coords;
}

function fixAndFocusCellAt(offset) {
    if(cellWithFocus) {
        var fixedCoords = fixCoordinatesIfOutsideBounds(
            {
                x: cellWithFocus.x+offset.x,
                y: cellWithFocus.y+offset.y
            }
        );
        focusMgr.focusCellAt(fixedCoords);
    }
}

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
    fixAndFocusCellAt(
        {
            x: 1,
            y: 0
        }
    );
};

focusMgr.left = function() {
    fixAndFocusCellAt(
        {
            x: -1,
            y: 0
        }
    );
};

focusMgr.up = function() {
    fixAndFocusCellAt(
        {
            x:0,
            y:-1
        }
    );
};

focusMgr.down = function() {
    fixAndFocusCellAt(
        {
            x:0,
            y:1
        }
    );
};

focusMgr.focusCellAt = function(coords) {
    this.focusCell(this.wc.datagrid.getCellAt(coords.x,coords.y), true);
};

focusMgr.focusCell = function(cell, makeVisible) {
    if(cell) {
        if(helper.isCellEditable(cell)) {
            this.removeCellFocus();
            cellWithFocus = {
                x: cell.cellIndex,
                y: cell.rowIndex
            };
            cell.setAttribute('focus', 'focus');
            if (makeVisible) {
                this.wc.datagrid.makeCellVisible(cell.rowIndex, cell.cellIndex);
            }
        }
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
        this.focusCell(this.focusedCell(), false);
    }
};

module.exports = focusMgr;