var editMgr = {};
var helper = require('./helper');
var focusMgr = require('./focusMgr');

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

editMgr.isEditing = function() {
    return this.isEditing;
};

editMgr.hide = function() {
    this.isEditing = false;
    this.wc.onHide();
};

editMgr.left = function() {
    var nextCell = this.wc.datagrid.getCellAt((this.wc.cell.cellIndex-1),(this.wc.cell.cellRow));
    this.edit(nextCell);
};

editMgr.right = function() {
    var nextCell = this.wc.datagrid.getCellAt((this.wc.cell.cellIndex+1),(this.wc.cell.cellRow));
    this.edit(nextCell);
};

editMgr.up = function() {
    var nextCell = this.wc.datagrid.getCellAt((this.wc.cell.cellIndex),(this.wc.cell.cellRow-1));
    this.edit(nextCell);
};

editMgr.down = function() {
    var nextCell = this.wc.datagrid.getCellAt((this.wc.cell.cellIndex),(this.wc.cell.cellRow+1));
    this.edit(nextCell);
};

module.exports = editMgr;