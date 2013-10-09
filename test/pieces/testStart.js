var TestSuite = require('spatester');
var datagrid,
    cellEditor,
    datagridContent = [
        [{
            value: "_1"
        }, {
            value: "A1"
        }, {
            value: "B1"
        }, {
            value: "C1"
        }],
        [{
            value: "_2"
        }, {
            value: "A2"
        }, {
            value: "B2"
        }, {
            value: "C2"
        }]
    ];

var testSuite = new TestSuite("inativ-x-cell-editor test", {
    setUp: function() {
        datagrid = document.createElement('x-datagrid');
        datagrid.setAttribute('id', "datagrid");
        datagrid.setAttribute('cell-height', 20);
        datagrid.setAttribute('cell-width', 100);
        datagrid.setAttribute('filter', false);
        cellEditor = document.createElement('x-cell-editor');

        document.querySelector('body').appendChild(datagrid);
        datagrid.registerPlugin(cellEditor);
        datagrid.data = {
            colHeader: [
                [{
                    value: 'column0'
                }, {
                    value: 'column1',
                    editor: function() {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'text');
                        input.affectValue = function(value) {
                            this.value = value;
                        };
                        input.getValue = function() {
                            return this.value;
                        };
                        input.setFocus = input.focus;
                        return input;
                    }
                }, {
                    value: 'column2',
                    editor: function() {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'text');
                        input.affectValue = function(value) {
                            this.value = value;
                        };
                        input.getValue = function() {
                            return this.value;
                        };
                        input.setFocus = input.focus;
                        return input;
                    }
                }, {
                    value: 'column3'
                }]
            ],
            content: datagridContent
        };

        datagrid.addEventListener('cellChanged', function(e) {
            var cell = e.detail.cell;
            datagridContent[cell.cellRow][cell.cellIndex].value = e.detail.newValue;
            datagrid.content = datagridContent;
        });
    },

    tearDown: function() {
        var datagrid = document.querySelector('x-datagrid');
        // TODO problème ie9
        //datagrid.removeEventListener('cellChanged');
        document.body.removeChild(datagrid);
    }
});

function assertCellEditorIsAboveCell(rowIndex, colIndex) {
    return function() {
        var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(" + rowIndex + ") td:nth-child(" + colIndex + ")");
        return cellEditor.style.left === (editedCell.offsetLeft) + "px" && cellEditor.style.top === editedCell.offsetTop + "px";
    };
}