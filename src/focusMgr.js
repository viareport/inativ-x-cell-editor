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

function fixAndFocusCellAt(coords) {
    var fixedCoords = fixCoordinatesIfOutsideBounds(coords);
    focusMgr.focusCellAt(fixedCoords);
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
            x: cellWithFocus.x+1,
            y: cellWithFocus.y
        }
    );
};

focusMgr.left = function() {
    fixAndFocusCellAt(
        {
            x: cellWithFocus.x-1,
            y: cellWithFocus.y
        }
    );
};

focusMgr.up = function() {
    fixAndFocusCellAt(
        {
            x:cellWithFocus.x,
            y:cellWithFocus.y-1
        }
    );
};

focusMgr.down = function() {
    fixAndFocusCellAt(
        {
            x:cellWithFocus.x,
            y:cellWithFocus.y+1
        }
    );
};

focusMgr.focusCellAt = function(coords) {
    this.focusCell(this.wc.datagrid.getCellAt(coords.x,coords.y));
};

focusMgr.focusCell = function(cell) {
    if(cell) {
        if(helper.isCellEditable(cell)) {
            this.removeCellFocus();
            cellWithFocus = {
                x: cell.cellIndex,
                y: cell.rowIndex
            };
            cell.setAttribute('focus', 'focus');
            this.wc.datagrid.makeCellVisible(cell.rowIndex, cell.cellIndex);
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
        this.focusCell(this.focusedCell());
    }
};

module.exports = focusMgr;