var focusMgr = require('./focusMgr');
var editMgr = require('./editMgr');
var helper = require('./helper');

var mouseListener = {};


function getParentCell(node) {
    var cell = node;
    while (cell.nodeName.toLowerCase() !== 'td' && cell.parentNode) {
        cell = cell.parentNode;
    }
    return cell;
}

mouseListener.dblClickCell = function(e) {
    if(!editMgr.isEditing) {
        var cell = getParentCell(e.target);
        if (cell) {
            focusMgr.focusCellAt({
                x: cell.cellIndex, 
                y: cell.rowIndex
            });
            editMgr.edit(cell);
        }
    }
};

mouseListener.clickCell = function(e) {
    if(!editMgr.isEditing) {
        var target = getParentCell(e.target);
        if(target) {
            focusMgr.focusCellAt({
                x: target.cellIndex, 
                y: target.rowIndex
            });
        }
    }
};

mouseListener.clickoutside = function(e) {
    var elt = e.target;
    while (elt) {
        if (elt === this || elt === this.cell) {
            return;
        }
        elt = elt.parentNode;
    }
    this.affectValue();
    editMgr.hide();
};

mouseListener.clickOutsideDatagrid = function(e) {
    var elt = e.target;
    while (elt) {
        if (elt === this.datagrid.contentWrapper) {
            return;
        }
        elt = elt.parentNode;
    }

    focusMgr.removeCellFocus();
};

module.exports = mouseListener;