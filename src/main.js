require('inativ-x-datagrid');
(function () {
    function doesSupportCustomEventConstructor() {
        try {
            if (new Event('submit', { bubbles: false }).bubbles !== false) {
                return false;
            } else if (new Event('submit', { bubbles: true }).bubbles !== true) {
                return false;
            } else if (new Event('submit', { detail: 'toto'}).detail !== 'toto') {
                return false;
            } else {
                return true;
            }
        } catch (e) {
            return false;
        }

    }

    if (!doesSupportCustomEventConstructor()) {
        window.CustomEvent = function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.CustomEvent.prototype;
    }
})();

(function () {

    // --- Callbacks
    var clickCellListener = function (e) {

            var cell = e.target;
            while (cell.nodeName.toLowerCase() !== 'td') {
                cell = cell.parentNode;
            }
            if (cell) {
                this.edit(cell);
            }
        },
        inputKeyListener = function (e) {
            switch (e.keyCode) {
                case 27: // ESC
                    this.hide();
                    break;
                case 13: // ENTER
                    this.affectValue();
                    this.hide();
                    break;
                // case 9: // TAB
                //     if (!e.ctrlKey && !e.altKey) {
                //         e.preventDefault();
                //         e.stopPropagation();
                //         this.affectValue();
                //         if (e.shiftKey) {

                //             this.moveLeft();
                //         }
                //         else {
                //             this.moveRight();
                //         }
                //     }
                //     break;

                // case 37: // LEFT
                //     e.preventDefault();
                //     e.stopPropagation();
                //     this.affectValue();
                //     this.moveLeft();
                //     break;
                // case 38: // UP
                //     e.preventDefault();
                //     e.stopPropagation();
                //     this.affectValue();
                //     this.moveUp();
                //     break;
                // case 39: // right
                //     e.preventDefault();
                //     e.stopPropagation();
                //     this.affectValue();
                //     this.moveRight();
                //     break;
                // case 40: // down
                //     e.preventDefault();
                //     e.stopPropagation();
                //     this.affectValue();
                //     this.moveDown();
                //     break;
            }
        },
        clickoutsideListener = function (e) {
            var elt = e.target;
            while (elt) {
                if (elt === this || elt === this.cell) {
                    return;
                }
                elt = elt.parentNode;
            }
            this.affectValue();
            this.hide();
            //  e.stopPropagation();
        };

    xtag.register('x-cell-editor', {
        lifecycle: {
            created: function created() {
                this.keyListener = inputKeyListener.bind(this);
                this.clickoutsideListener = clickoutsideListener.bind(this);
                this.clickCellListener = clickCellListener.bind(this);
                this.cell = null;
                this.cellDomIndex = 0;
            },

            inserted: function inserted() {
                var cellEditor = this;
                this._editableColumns = [];
                this._editors = [];
                this.datagrid.header[0].forEach(function (columnDefinition, columnIndex) {
                    if (columnDefinition.editor) {
                        this._editableColumns.push(columnIndex);
                        this._editors[columnIndex] = columnDefinition.editor();
                    }
                }.bind(this));

                this.style.display = 'none';

                //TODO A déplacer dans bloc 'events'
                this.datagrid.contentWrapper.addEventListener('dblclick', this.clickCellListener);
            },
            removed: function removed() {
                this.hide();

                //TODO A Priori inutile
                this.datagrid.contentWrapper.removeEventListener('dblclick', this.clickCellListener);
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
            edit: function edit(cell) {

                if(!this._isColumnEditable(cell.cellIndex)) {
                    return;
                }

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
                /*
                 this.inputField.value = this.cell.cellValue;
                 this.inputField.select();*/

                //TODO A déplacer dans bloc 'events'
                document.addEventListener('keyup', this.keyListener, false);
                document.addEventListener('click', this.clickoutsideListener, true);
            },
            append: function append() {
                this.datagrid.contentWrapper.appendChild(this);
            },
            onResize: function resize() {
                this.calculateWidthAndLeft();
            },
            hide: function hide() {
                this.style.display = 'none';

                this.dispatchEvent(new CustomEvent('stopEditing', {
                    'detail': {
                        cell: this.cell
                    },
                    'bubbles': true,
                    'cancelable': false
                }));

                this.cell = null;

                //TODO A Priori inutile
                document.removeEventListener('keyup', this.keyListener, false);
                document.removeEventListener('click', this.clickoutsideListener, true);
                // this.inputField.setAttribute('value', '');
            },
            moveLeft: function moveLeft() {
                var nextCell = this.datagrid.getCellAt((this.cell.cellIndex-1),(this.cell.cellRow));
                this._moveTo(nextCell);
            },
            moveRight: function moveRight() {
                var nextCell = this.datagrid.getCellAt((this.cell.cellIndex+1),(this.cell.cellRow));
                this._moveTo(nextCell);
            },
            moveUp: function moveRight() {
                var nextCell = this.datagrid.getCellAt((this.cell.cellIndex),(this.cell.cellRow-1));
                this._moveTo(nextCell);
            },
            moveDown: function moveRight() {
                var nextCell = this.datagrid.getCellAt((this.cell.cellIndex),(this.cell.cellRow+1));
                this._moveTo(nextCell);
            },

            _moveTo: function moveTo(cell) {
                if (cell && this._isColumnEditable(cell.cellIndex)) {
                    this.hide();
                    this.edit(cell);
                }
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

            _isColumnEditable: function _isColumnEditable(columnIndex) {
                return this._editors[columnIndex];
            }
        }
    });
})();
