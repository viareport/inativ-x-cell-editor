require('inativ-x-datagrid');
require('./polyfill');
var mouseListener = require('./mouseListener');
var keyboardListener = require('./keyboardListener');
var focusMgr = require('./focusMgr');
var editMgr = require('./editMgr');
var helper = require('./helper');

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

                var cellEditor = this;
                this._editableColumns = [];
                this._editors = [];
                var firstColumn = null;
                this.datagrid.header[0].forEach(function (columnDefinition, columnIndex) {
                    if (columnDefinition.editor) {
                        firstColumn = firstColumn == null ? columnIndex : Math.min(columnIndex, firstColumn);
                        this._editableColumns.push(columnIndex);
                        this._editors[columnIndex] = columnDefinition.editor();
                    }
                }.bind(this));

                this.style.display = 'none';

                var firstEditableCell = this.datagrid.getCellAt(firstColumn, 0);
                focusMgr.focusCell(firstEditableCell);

                //TODO A déplacer dans bloc 'events'
                this.datagrid.contentWrapper.addEventListener('click', this.clickCellListener);
                this.datagrid.contentWrapper.addEventListener('dblclick', this.dblClickCellListener);
                document.addEventListener('click', this.clickOutsideDatagrid);
                document.addEventListener('keydown', this.focusListener, true);
            },
            removed: function removed() {
                editMgr.hide();
                this.datagrid.contentWrapper.removeEventListener('dblclick', this.dblClickCellListener);
                this.datagrid.contentWrapper.removeEventListener('click', this.clickCellListener);
                document.removeEventListener('click', this.clickOutsideDatagrid);
                document.removeEventListener('keydown', this.focusListener, true);
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
            onResize: function resize() {
                this.calculateWidthAndLeft();
            },
            onEdit: function edit(cell) {
                this.dispatchEvent(new CustomEvent('startEditing', {
                    'detail': {
                        cell: cell
                    },
                    'bubbles': true,
                    'cancelable': false
                }));
                var top = cell.offsetTop,
                    height = cell.clientHeight,
                    editor = this._editors[cell.cellIndex];
                    
                this.cell = cell;
                this.cellDomIndex = cell.cellIndex + 1;
                this.style.top = top + 'px';
                this.style.height = height + 'px';
                this.style.display = 'inline-block';
                this.calculateWidthAndLeft();

                this.innerHTML = '';
                editor.affectValue(cell.cellValue);
                this.appendChild(editor);
                editor.focus();

                document.addEventListener('keydown', this.editionListener, true);
                document.addEventListener('click', this.clickoutsideListener, true);
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

                document.removeEventListener('keydown', this.editionListener, true);
                document.removeEventListener('click', this.clickoutsideListener, true);
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
                // this.style.width = columnHeaderCell.clientWidth + 'px';
            },

            onContentRendered: function onContentRendered() {
                focusMgr.onContentRendered();
            }
        }
    });
})();
