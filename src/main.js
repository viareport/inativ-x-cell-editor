require('inativ-x-datagrid');
require('./polyfill');
var mouseListener = require('./mouseListener');
var keyboardListener = require('./keyboardListener');
var focusMgr = require('./focusMgr');
var editMgr = require('./editMgr');
var helper = require('./helper');

function callBackStopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
}

(function () {

    xtag.register('x-cell-editor', {
        lifecycle: {
            created: function created() {
                this.clickoutsideListener = mouseListener.clickoutside.bind(this);
                this.dblClickCellListener = mouseListener.dblClickCell.bind(this);
                this.clickCellListener = mouseListener.clickCell.bind(this);
                this.clickOutsideDatagrid = mouseListener.clickOutsideDatagrid.bind(this);

                this.editionListener = keyboardListener.editionListener.bind(this);
                this.focusListener = keyboardListener.focusListener.bind(this);

                this.cell = null;
                this.cellDomIndex = 0;
            },

            inserted: function inserted() {
                helper.init(this);
                focusMgr.init(this);
                editMgr.init(this);

                this.style.display = 'none';

                this.prepareEditors();

                var firstEditableCell = this.datagrid.getCellAt(this.getFirstEditableColumn(), 0);
                focusMgr.focusCell(firstEditableCell);

                //TODO A déplacer dans bloc 'events'
                this.datagrid.contentWrapper.addEventListener('click', this.clickCellListener);
                this.datagrid.contentWrapper.addEventListener('dblclick', this.dblClickCellListener);
                document.addEventListener('click', this.clickOutsideDatagrid);
                document.addEventListener('keydown', this.focusListener);
            },
            removed: function removed() {
                editMgr.hide();
                this.datagrid.contentWrapper.removeEventListener('dblclick', this.dblClickCellListener);
                this.datagrid.contentWrapper.removeEventListener('click', this.clickCellListener);
                document.removeEventListener('click', this.clickOutsideDatagrid);
                document.removeEventListener('keydown', this.focusListener);
            },
            attributeChanged: function attributedChanged() {
            }
        },
        events: {
            dblclick: function clickEvent(e) {
                // permet de gérer si on double clique dans l'editor
                e.stopPropagation();
            }
        },
        accessors: {
        },

        methods: {
            getFirstEditableColumn: function() {
                var firstEditableColumn = null;
                this.datagrid.header[0].forEach(function (columnDefinition, columnIndex) {
                    if (columnDefinition.editor) {
                        firstEditableColumn = firstEditableColumn == null ? columnIndex : Math.min(columnIndex, firstEditableColumn);
                    }
                });
                return firstEditableColumn;
            },

            prepareEditors: function() {
                this._editors = [];
                this._editableColumns = [];
                this.datagrid.header[0].forEach(function (columnDefinition, columnIndex) {
                    if (columnDefinition.editor) {
                        this._editableColumns.push(columnIndex);
                        this._editors[columnIndex] = columnDefinition.editor();
                    }
                }.bind(this));
            },
            stopScrollOnDatagrid: function () {
                var domTrElements = this.datagrid.contentWrapper.querySelectorAll('tr');
                var i = 0;
                for (; i < domTrElements.length; i++) {
                    domTrElements.item(i).addEventListener('wheel', callBackStopEvent, true);
                }
            },
            restoreScrollOnDatagrid: function () {
                var domTrElements = this.datagrid.contentWrapper.querySelectorAll('tr');
                var i = 0;
                for (; i < domTrElements.length; i++) {
                    domTrElements.item(i).removeEventListener('wheel', callBackStopEvent, true);
                }
            },
            onResize: function resize() {
                this.calculateDisplayPosition();
            },
            onEdit: function edit(cell) {
                this.stopScrollOnDatagrid();
                this.dispatchEvent(new CustomEvent('startEditing', {
                    'detail': {
                        cell: cell
                    },
                    'bubbles': true,
                    'cancelable': false
                }));
                this.cell = cell;
                this.calculateDisplayPosition();

                var editor = this._editors[cell.cellIndex];
                this.innerHTML = '';
                editor.affectValue(cell.cellValue);
                this.appendChild(editor);
                editor.setFocus();

                document.addEventListener('keydown', this.editionListener);
                document.addEventListener('click', this.clickoutsideListener, true);
            },
            calculateDisplayPosition: function() {
                var cell = this.cell;

                if(cell) {
                    var top = cell.offsetTop,
                    // Normalement dans ce calcul il faudrait prendre en compte le border des td tr
                        bottom = this.datagrid.contentWrapper.offsetHeight - (cell.offsetTop + cell.clientHeight),
                        height = cell.clientHeight,
                        editor = this._editors[cell.cellIndex];

                    this.cellDomIndex = cell.cellIndex + 1;
                    if (helper.isBeforeMiddleDisplayInDatagrid(cell.cellRow)) {
                        this.style.top = top + 'px';
                        this.style.bottom = "";
                    } else {
                        this.style.bottom = bottom + 'px';
                        this.style.top = "";
                    }
                    this.style.height = height + 'px';
                    this.style.display = 'inline-block';
                }
                this.calculateWidthAndLeft();
            },
            append: function append() {
                this.datagrid.contentWrapper.appendChild(this);
            },
            onHide: function hide() {
                this.style.display = 'none';

                this.dispatchEvent(new CustomEvent('stopEditing', {
                    'detail': {
                        cell: this.cell
                    },
                    'bubbles': true,
                    'cancelable': false
                }));

                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }

                document.removeEventListener('keydown', this.editionListener);
                document.removeEventListener('click', this.clickoutsideListener, true);
                this.restoreScrollOnDatagrid();
            },

            affectValue: function affectValue() {
                var editorValue = this._editors[this.cell.cellIndex].getValue();
                if (editorValue !== this.cell.cellValue) {
                    var event = new CustomEvent('cellChanged', {
                        'detail': {
                            cell: this.cell,
                            newValue: editorValue
                        },
                        'bubbles': true,
                        'cancelable': false
                    });
                    this.dispatchEvent(event);
                }
            },
            calculateWidthAndLeft: function calculateWidthAndLeft() {
                var columnHeaderCell = this.datagrid.getThColumnHeader(this.cellDomIndex);
                if (!columnHeaderCell) {
                    return;
                }
                this.style.left = columnHeaderCell.offsetLeft + 'px';
                this.style.width = columnHeaderCell.clientWidth + 'px';
            },

            onContentRendered: function onContentRendered() {
                focusMgr.onContentRendered();
                this.prepareEditors();
            }
        }
    });
})();
