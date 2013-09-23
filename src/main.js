require('inativ-x-datagrid');
//TODO Faire un npm
(function () {
    function doesSupportCustomEventConstructor() {
        try {
//            var test = new CustomEvent();
//            if (!test) {
//                return false;
//            }else
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

            //TODO Rajouter test pour filtrer les colonnes non éditables
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
                case 9: // TAB
                    if (!e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.affectValue();
                        if (e.shiftKey) {

                            this.moveLeft();
                        }
                        else {
                            this.moveRight();
                        }
                    }
                    break;
//                case 39: //right arrow
//                    e.preventDefault();
//                    e.stopPropagation();
//                    this.affectValue();
//                    this.moveRight();
//                    break;
//                case 37: //right arrow
//                    e.preventDefault();
//                    e.stopPropagation();
//                    this.affectValue();
//                    this.moveLeft();
//                    break;
            }
        },
        clickoutsideListener = function (e) {
            // console.log("click outside");
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
                this.cellDomIndex = null;
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
                document.addEventListener('keydown', this.keyListener, true);
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
                this.cell = null;

                //TODO A Priori inutile
                document.removeEventListener('keydown', this.keyListener, true);
                document.removeEventListener('click', this.clickoutsideListener, true);
                // this.inputField.setAttribute('value', '');
            },
            moveLeft: function moveLeft() {
                var previousCell = this.cell.previousSibling;// || (this.cell.parentNode.previousSibling && this.cell.parentNode.previousSibling.childNodes[this.cell.parentNode.previousSibling.childNodes.length - 1]);
                if (previousCell) {
                    this.hide();
                    previousCell = this.datagrid.getCellAt((previousCell.cellIndex), (previousCell.cellRow));
                    this.edit(previousCell);
                }
            },
            moveRight: function moveRight() {
                var nextCell = this.cell.nextSibling;// || (this.cell.parentNode.nextSibling && this.cell.parentNode.nextSibling.childNodes[0]);
                if (nextCell) {
                    this.hide();
                    nextCell = this.datagrid.getCellAt((nextCell.cellIndex),(nextCell.cellRow));
                    this.edit(nextCell);
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
                this.style.left = columnHeaderCell.offsetLeft + 'px';
                this.style.width = columnHeaderCell.clientWidth + 'px';
            }
        }
    });
})();
