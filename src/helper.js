var helper = {};

helper.init = function(wc) {
    this.wc = wc;
};

helper.isCellEditable = function(cell) {
    return cell && helper.isColumnEditable(cell.cellIndex);
};

helper.isColumnEditable = function(columnIndex) {
    return this.wc._editors && this.wc._editors[columnIndex];
};

module.exports = helper;