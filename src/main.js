require('inativ-x-datagrid');
(function(){

    // --- Callbacks
    var clickCellListener = function(e) {

            //TODO Rajouter test pour filtrer les colonnes non éditables
            var cell = e.target;
            while (cell.nodeName.toLowerCase() !== 'td') {
                cell = cell.parentNode;
            }
            if (cell) {
                this.edit(cell);
            }
        },
        inputKeyListener = function(e) {
            //console.log("key", e.keyCode);
            switch (e.keyCode) {
                case 27: // ESC
                    this.hide();
                    break;
                case 13: // ENTER
                    this.affectValue();
                    break;
                case 9: // TAB
                    if(!e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        if(e.shiftKey) {
                            this.moveLeft();
                        }
                        else {
                            this.moveRight();
                        }
                    }
                    break;
            }
        },
        clickoutsideListener = function(e) {
            // console.log("click outside");
            var elt = e.target;
            while (elt) {
                if (elt === this || elt === this.cell) {
                    return;
                }
                elt = elt.parentNode;
            }
            this.affectValue();
            //  e.stopPropagation();
        };

    xtag.register('x-cell-editor', {
        lifecycle: {
            created: function created() {
                this.keyListener = inputKeyListener.bind(this);
                this.clickoutsideListener = clickoutsideListener.bind(this);
                this.clickCellListener = clickCellListener.bind(this);
            },
            inserted: function inserted() {
                var cellEditor = this;
                this._editableColumns = [];
                this._editors = [];
                this.datagrid.header[0].forEach(function (columnDefinition, columnIndex) {
                    if (columnDefinition.editor) {
                        this._editableColumns.push(columnIndex);
                        this._editors[columnIndex] =  columnDefinition.editor();
                    }
                }.bind(this));

                this.style.display = 'none';

                this.datagrid.contentWrapper.addEventListener('dblclick', this.clickCellListener);
            },
            removed: function removed() {
                this.hide();
                this.datagrid.contentWrapper.removeEventListener('dblclick', this.clickCellListener);
            },
            attributeChanged: function attributedChanged() {
            }
        },
        events: {
            dblclick : function clickEvent(e) {
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
                this.cellIndex = cell.cellIndex + 1;
                this.style.top = top + 'px';
                this.style.height = height + 'px';
                this.style.display = 'inline-block';
                this.calculateWidthAndLeft();

                this.cell = cell;

                this.innerHTML = '';
                editor.affectValue(cell.cellValue);
                this.appendChild(editor);
/*
                this.inputField.value = this.cell.cellValue;
                this.inputField.select();*/

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

                document.removeEventListener('keydown', this.keyListener, true);
                document.removeEventListener('click', this.clickoutsideListener, true);
               // this.inputField.setAttribute('value', '');
            },
            moveLeft: function moveLeft() {
                var previousCell = this.cell.previousSibling || (this.cell.parentNode.previousSibling && this.cell.parentNode.previousSibling.childNodes[this.cell.parentNode.previousSibling.childNodes.length - 1]);
                this.affectValue();
                if(previousCell) {
                    this.edit(previousCell);
                }
            },
            moveRight: function moveRight() {
                var nextCell = this.cell.nextSibling || (this.cell.parentNode.nextSibling && this.cell.parentNode.nextSibling.childNodes[0]);
                this.affectValue();
                if(nextCell) {
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
                this.hide();
            },
            calculateWidthAndLeft: function calculateWidthAndLeft() {
                var columnHeaderCell = this.datagrid.getThColumnHeader(this.cellIndex);
                this.style.left = columnHeaderCell.offsetLeft + 'px';
                this.style.width = columnHeaderCell.clientWidth + 'px';
            }
        }
    });
})();
