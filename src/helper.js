var helper = {
    wc: null
};

function isColumnEditable(columnIndex) {
    return helper.wc._editors && helper.wc._editors[columnIndex];
}

helper.init = function(wc) {
    this.wc = wc;
};

helper.isCellEditable = function(cell) {
    return cell && isColumnEditable(cell.cellIndex);
};

helper.isBeforeMiddleDisplayInDatagrid = function (rowIndex) {
    var middleIndex = (this.wc.datagrid.firstRowDisplay + this.wc.datagrid._nbRowDisplay)/2;
    return rowIndex <= middleIndex;
};

module.exports = helper;