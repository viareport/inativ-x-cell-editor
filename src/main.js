(function(){

    var clickCellListener = function(e) {
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
                    this.setValue();
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
            this.setValue();
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
                var datagridContent = this.parentNode;
                this.datagrid = datagridContent.parentNode;

                this.style.display = 'none';

                this.inputField = document.createElement('input');
                this.inputField.setAttribute('type', 'text');
                this.appendChild(this.inputField);

                datagridContent.querySelector('table').addEventListener('click', this.clickCellListener);
            },
            removed: function removed() {
                this.hide();
                this.datagrid.querySelector('.contentWrapper table').removeEventListener('click', this.clickCellListener);
            },
            attributeChanged: function attributedChanged() {
            }
        },
        events: {
        },
        accessors: {
        },
        methods: {
            edit: function edit(cell) {
                var top = cell.offsetTop,
                    left = cell.offsetLeft,
                    height = cell.clientHeight,
                    width = cell.clientWidth;

                this.style.top = top + 'px';
                this.style.left = left+ 'px';
                this.style.width = width + 'px';
                this.style.height = height + 'px';
                this.style.display = 'inline-block';

                this.cell = cell;

                this.inputField.value = this.cell.cellValue;
                this.inputField.select();

                document.addEventListener('keydown', this.keyListener, true);
                document.addEventListener('click', this.clickoutsideListener, true);
            },
            hide: function hide() {
                this.style.display = 'none';
                this.cell = null;

                document.removeEventListener('keydown', this.keyListener, true);
                document.removeEventListener('click', this.clickoutsideListener, true);
                this.inputField.setAttribute('value', '');
            },
            moveLeft: function moveLeft() {
                var previousCell = this.cell.previousSibling || (this.cell.parentNode.previousSibling && this.cell.parentNode.previousSibling.childNodes[this.cell.parentNode.previousSibling.childNodes.length - 1]);
                this.setValue();
                if(previousCell) {
                    this.edit(previousCell);
                }
            },
            moveRight: function moveRight() {
                var nextCell = this.cell.nextSibling || (this.cell.parentNode.nextSibling && this.cell.parentNode.nextSibling.childNodes[0]);
                this.setValue();
                if(nextCell) {
                    this.edit(nextCell);
                }
            },
            setValue: function setValue() {
                var event = new CustomEvent('cellChanged', {
                    'detail': {
                        cell: this.cell,
                        newValue: this.inputField.value
                    },
                    'bubbles': true,
                    'cancelable': false
                });
                this.dispatchEvent(event);
                this.hide();
            }
        }
    });
})();
