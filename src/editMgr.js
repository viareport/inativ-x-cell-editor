var helper = require('./helper');
var focusMgr = require('./focusMgr');

var editMgr = {
    wc: null,
    isEditing: false
};

function editAt(coords) {
    var cell = editMgr.wc.datagrid.getCellAt(coords.x,coords.y);
    focusMgr.edit(cell);
}

editMgr.init = function(wc) {
    this.wc = wc;
    this.isEditing = false;
};

editMgr.edit = function(cell) {
    if (helper.isCellEditable(cell)) {
        if (this.isEditing) {
            this.hide();
        }
        this.isEditing = true;
        focusMgr.removeCellFocus();
        this.wc.onEdit(cell);
    }
};

editMgr.hide = function() {
    if(this.isEditing) {
        this.isEditing = false;
        this.wc.onHide();
    }
};

editMgr.left = function() {
    editAt({
        x: this.wc.cell.cellIndex-1,
        y: this.wc.cell.cellRow
    });
};

editMgr.right = function() {
    editAt({
        x: this.wc.cell.cellIndex+1,
        y: this.wc.cell.cellRow
    });
};

editMgr.up = function() {
    editAt({
        x: this.wc.cell.cellIndex,
        y: this.wc.cell.cellRow-1
    });
};

editMgr.down = function() {
    editAt({
        x: this.wc.cell.cellIndex,
        y: this.wc.cell.cellRow+1
    });
};

module.exports = editMgr;