;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('inativ-x-inputfilter');
(function () {
    'use strict';
    /* Methods ou on a juste un wrapper (x-datagrid) autour d'une table */
    /* Les perfs sont meilleurs qu'avec l'autre technique, mais il faudrait quand même utiliser la technique de w2ui */
    function escapeRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    function defaultTemplate(value) {
        if (value === null) {
            return '';
        }
        return value;
    }

    xtag.register('x-datagrid', {
        lifecycle: {
            created: function created() {
                this.contentWrapper = document.createElement('div');
                this.contentWrapper.setAttribute('class', 'contentWrapper'); //FIXME no camel case
                this.tableContent = document.createElement("table");
                this.contentWrapper.appendChild(this.tableContent);
                this.columnHeaderWrapper = document.createElement('div');
                this.columnHeaderWrapper.setAttribute('class', 'columnHeaderWrapper'); //FIXME no camel case
                this.rowHeight = getTrHeight();
                this.appendChild(this.columnHeaderWrapper);
                this.appendChild(this.contentWrapper);
                this._scrollTop = 0;
                this._filters = [];
                this.lastCurrentRow = 0;
                this.scrollBarWidth = getScrollBarWidth();
                this.tableMinWidth = 0;
                this.plugins = [];
            },
            inserted: function inserted() {
                var grid = this;
                this.originOnResize = window.onresize || function(){};
                window.onresize = function (e) {
                    grid.originOnResize();
                    grid.calculateContentSize();
                    grid.calculateHeaderWidth(grid.displayedData.length);
                    grid.plugins.forEach(function(plugin){
                        plugin.onResize();
                    });
                };
            },
            removed: function removed() {
                window.onresize = this.originOnResize;
            },
            attributeChanged: function attributedChanged() {
            //TODO editable
            }
        },
        events: {
            contentUpdated: function contentUpdated() {
                this._displayedData = null;
                this.renderContent(this.lastCurrentRow);
            },
            headerUpdated: function headerUpdated() {
                this.renderHeaders(this.data);
            },
            /*cellChanged: function dataUpdated(e) {
                var cell = e.detail.cell,
                    newValue = e.detail.newValue;

                this.data.content[cell.cellRow].rowValue[cell.cellIndex].value = newValue;
                cell.cellValue = newValue;
                cell.querySelector('div').innerHTML = newValue; //TODO colHeader.cellTemplate

                //TODO cacher la ligne si les données ne matchent plus les filtres ?
            },*/
            click: function (elem) {
                //this.render(this.sort(elem.target.parentNode.cellIndex), this.calculateCurrentLine());
            },
            scroll: function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.target === this.contentWrapper) {
                    //this._scrollTop = Number(e.target.scrollTop);
                    var currentRow = this.calculateCurrentLine(Number(e.target.scrollTop));

                    var diffBetweenLastCurrentRow = Math.abs(currentRow - this.lastCurrentRow);
                    if (diffBetweenLastCurrentRow > this._nbRowDisplay) {
                        this.lastCurrentRow = currentRow;
                        this.renderContent(currentRow);
                    }
                }
            },
            filter: function (e) {
                this._displayedData = null;
                this.lastCurrentRow = 0;
                if (e.detail.filterValue === undefined || e.detail.filterValue === "") {
                    delete this._filters[e.detail.column];
                } else {
                    this._filters[e.detail.column] = e.detail.filterValue;
                }
                this.renderContent(0);
            }
        },
        accessors: {
            data: {
                set: function (data) {
                    this._data = {};
                    this.header = data.colHeader;
                    this.content = data.content;
                },
                get: function () {
                    return this._data;
                }
            },
            header: {
                set: function (header) {
                    this._data.colHeader = header;
                    var event = new CustomEvent('headerUpdated');
                    this.dispatchEvent(event);
                },
                get: function () {
                    return this._data.colHeader;
                }
            },
            content: {
                set: function (content) {
                    this._data.content = []; // Okazou on viendrait du setData
                    this._nbRow = content.length;

                    for (var i = 0; i < content.length; i++) {
                        this._data.content.push({
                            originIndex: i,
                            rowValue: content[i]
                        });
                    }
                    var event = new CustomEvent('contentUpdated');
                    this.dispatchEvent(event);
                },
                get: function () {
                    throw new Error("No getter available on datagrid content");
                }
            },
            displayedData: {
                get: function () {
                    if (!this._displayedData) {
                        var filteredData = this._data.content;

                        this._filters.forEach(function (filter, columnIndex) {
                            filteredData = this.applyFilter(filter, columnIndex, filteredData);
                        }, this);

                        this._displayedData = filteredData;
                    }

                    return this._displayedData;
                }
            }

        },
        methods: {
            registerPlugin: function register(plugin) {
                plugin.datagrid = this;
                plugin.append();
                this.plugins.push(plugin);
            },
            render: function render(data, firstDisplay) {
                firstDisplay = firstDisplay || 0;
                var displayData = data || this._data;
                this.renderHeaders(displayData);
                this.renderContent(firstDisplay);
            },
            renderHeaders: function renderHeaders(data) {
                var tableColHeader = document.createElement("table");

                if (!data) {
                    return;
                }
                for (var j = 0; j < data.colHeader.length; j++) {
                    var trHeader = document.createElement("tr");
                    var colHeader;
                    for (var i = 0; i < data.colHeader[j].length; i++) {
                        colHeader = data.colHeader[j][i];
                        var tdHeader = this.renderHeader(colHeader, i);
                        trHeader.appendChild(tdHeader);
                    }
                    tableColHeader.appendChild(trHeader);
                }
                this.columnHeaderWrapper.innerHTML = '';
                this.columnHeaderWrapper.appendChild(tableColHeader);
                this.calculateContentSize();
            },
            renderHeader: function renderHeader(colHeader, coldIdx) {
                var tdHeader = document.createElement("th");
                if (colHeader.class) {
                    tdHeader.className += ' ' + colHeader.class;
                }
                if (colHeader.element) {
                    tdHeader.appendChild(colHeader.element);
                } else {
                    tdHeader.setAttribute('class', 'sortable');
                    if (colHeader.rowspan) {
                        tdHeader.setAttribute('rowspan', colHeader.rowspan);
                    }
                    if (colHeader.class) {
                        tdHeader.setAttribute('class', tdHeader.getAttribute('class') + ' ' + colHeader.class);
                    }
                    tdHeader.innerHTML = "<div class='x-datagrid-cell'>" + colHeader.value + "</div>";
                    if (colHeader.filter) {
                        var filter = document.createElement('x-inputfilter');
                        if (colHeader.defaultFilter) {
                            filter.setAttribute('defaultFilter', colHeader.defaultFilter);
                            this._filters[coldIdx] = colHeader.defaultFilter;
                        }
                        filter.setAttribute('column', coldIdx);
                        tdHeader.appendChild(filter);
                    }
                }
                return tdHeader;
            },
            renderContent: function renderContent(currentRowDisplay) {
                var displayData = this.displayedData;
                var tableContentFragment = document.createDocumentFragment();
                var firstRowCreate = currentRowDisplay - this.cachedRow,
                    lastRowCreate = currentRowDisplay + this._nbRowDisplay + this.cachedRow;

                this.calculateHeaderWidth(displayData.length);

                if (currentRowDisplay === 0) {
                    this.contentWrapper.scrollTop = 0;
                }

                if (firstRowCreate < 0) {
                    firstRowCreate = 0;
                }
                // Création de la première ligne qui doit simuler la taille de toutes les lignes présentes avant la ligne courante
                if (currentRowDisplay !== firstRowCreate) {
                    tableContentFragment.appendChild(this.simulateMultiRow(firstRowCreate));
                }
                if (lastRowCreate > displayData.length) {
                    lastRowCreate = displayData.length;
                }


                var rowIndex = firstRowCreate;
                var fragment = document.createDocumentFragment();
                for (; rowIndex < lastRowCreate; rowIndex++) {
                    var tr = document.createElement("tr");
                    tr.setAttribute('class', 'x-datagrid-tr');
                    var columnIndex = 0;
                    for (; columnIndex < displayData[rowIndex].rowValue.length; columnIndex++) {
                        var td = document.createElement("td"),
                            cellData = displayData[rowIndex].rowValue[columnIndex];

                            td.cellValue = cellData.value;
                            td.cellRow = displayData[rowIndex].originIndex;


                        td.setAttribute('class', ['x-datagrid-td', cellData.cellClass || null].join(' '));       // FIXME utiliser classlist

                        if (cellData.events) {
                            this.bindCustomEvents(cellData.events, td);
                        }
                        td.innerHTML = '';
                        if(cellData.errorMessage){         // c'est pas beau mais impossible de passer par le dataset pour un tooltip css (pas de polyfill pour IE)
                            td.innerHTML += '<span class="error-message">'+cellData.errorMessage+'</span>';
                        }
                        //TODO : class pourrait etre un tableau
                        var cellClass = cellData.class || '';
                        td.innerHTML += "<div class='x-datagrid-cell " + cellClass + "'>" + this.getCellTemplate(columnIndex)(cellData.value) + "</div>";
                        tr.appendChild(td);
                    }
                    fragment.appendChild(tr);
                }
                tableContentFragment.appendChild(fragment);
                // S'il y a plus de lignes que celles que l'on affiche
                if (lastRowCreate < displayData.length) {
                    var nbRowAfterCurrent = displayData.length - lastRowCreate;
                    tableContentFragment.appendChild(this.simulateMultiRow(nbRowAfterCurrent));
                    //et on en profite pour enlever la taille du scroll sur le tableau des colonnes headers
                }
                this.tableContent.innerHTML = '';

                this.tableContent.appendChild(tableContentFragment);

            },
            getCellTemplate: function getCellTemplate(columnIndex) {
                return this.header[0][columnIndex].cellTemplate || defaultTemplate;
            },
            sort: function sortData(columnIndex) {
                if (!columnIndex) {
                    throw new Error('a pas le column index pour sorter la data');
                }
                var displayData = new Object(this._data);
                var sortedData = displayData.slice(0);
                sortedData.sort(function (a, b) {
                    return a[columnIndex] - b[columnIndex];
                });
                displayData = sortedData;
                return displayData;
            },
            calculateHeaderWidth: function calculateHeaderWidth(nbSource) {
                this.columnHeaderWrapper.style.width = "100%";
                if (nbSource > this._nbRowDisplay) {
                    this.columnHeaderWrapper.style.width = (this.columnHeaderWrapper.offsetWidth - this.scrollBarWidth) + 'px';
                    this.columnHeaderWrapper.style.minWidth = (this.tableMinWidth - this.scrollBarWidth) + 'px';
                } else {
                    this.columnHeaderWrapper.style.minWidth = this.tableMinWidth + 'px';
                }
            },
            calculateContentSize: function calculateContentSize() {
                var contentWrapperHeight = this.offsetHeight - this.columnHeaderWrapper.offsetHeight;
                if (contentWrapperHeight <= 0) {
                    throw new Error("Wrong height calculated: " + contentWrapperHeight + "px. Explicitly set the height of the parent elements (consider position: absolute; top:0; bottom:0)");
                }

                var cellMinWidth = this.getAttribute('cell-width') || 150,
                    nbColumnsDisplay = Math.floor(this.offsetWidth / cellMinWidth);

                this.tableMinWidth = this.header[0].length * cellMinWidth;

                if (nbColumnsDisplay < this.header[0].length) {
                    contentWrapperHeight -= this.scrollBarWidth;
                } else {
                    this.contentWrapper.style.width = '100%';
                }
                this.contentWrapper.style.height = contentWrapperHeight + 'px';
                this.contentWrapper.style.minWidth = this.tableMinWidth + 'px';

                this._nbRowDisplay = Math.floor(contentWrapperHeight / this.rowHeight);
                this.cachedRow = this._nbRowDisplay * 2;
            },
            calculateCurrentLine: function getDisplayFirstLine(scrollTop) {
                var currentLine = Math.round(scrollTop / this.rowHeight);
                return  currentLine;
            },
            applyFilter: function applyFilter(filter, columnIndex, data) {
                if (columnIndex === undefined) {
                    throw new Error('Empty column index');
                }

                var regExp = new RegExp('^' + escapeRegExp(filter), "i");

                return data.filter(function (row) {
                    var elem = row.rowValue[columnIndex].value;
                    return regExp.test(elem);
                });
            },
            simulateMultiRow: function (nbRow) {
                var tr = document.createElement("tr"),
                    td = document.createElement("td");
                td.setAttribute("colspan", this.header[0].length);
                tr.appendChild(td);
                tr.style.height = (nbRow * this.rowHeight) + 'px';
                return tr;
            },
            bindCustomEvents: function (eventsTab, element) {
                var events = eventsTab;
                var eventTypes = Object.keys(events);
                var that = this;
                eventTypes.forEach(function (eventType) {
                    var eventName = eventType;
                    var customEventName = events[eventName].event;
                    var data = events[eventName].data;

                    var customEvent = new CustomEvent(customEventName, {'detail': data, 'bubbles': true});
                    element.addEventListener(eventName, function () {
                        that.dispatchEvent(customEvent);
                    });
                });
            },
            getThColumnHeader: function getColumnHeaderTdWidth(colIndex) {
                return this.columnHeaderWrapper.querySelector("tr:nth-child(1) th:nth-child(" + colIndex + ")");
            },
            getCellAt: function getCellAt(xCoord, yCoord) {
                return this.contentWrapper.querySelector("table tr:nth-child("+(yCoord+1)+") td:nth-child(" + (xCoord+1) + ")");
            }
        }
    });

    //Recuperation de la taille de la scrollbar selon le navigateur
    function getScrollBarWidth() {
        var inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";

        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild(inner);

        document.body.appendChild(outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 == w2) {
            w2 = outer.clientWidth;
        }
        document.body.removeChild(outer);
        return (w1 - w2);
    }

    function getTrHeight() {
        var table = document.createElement("table");
        var tr = document.createElement("tr");
        tr.setAttribute('class', 'x-datagrid-tr');
        var td = document.createElement("td");
        td.setAttribute('class', 'x-datagrid-td');
        td.innerHTML = "<div class='x-datagrid-cell'>test</div>";
        tr.appendChild(td);
        table.appendChild(tr);
        document.body.appendChild(table);
        var trOffsetHeight = tr.offsetHeight;
        document.body.removeChild(table);
        if(trOffsetHeight === 0) {
            throw new Error('Erreur lors du calcul de la hauteur disponible pour une ligne');
        }
        return trOffsetHeight;
    }

})();

},{"inativ-x-inputfilter":2}],2:[function(require,module,exports){
require('inativ-x-eraser');

(function(){  
    xtag.register('x-inputfilter', {
        lifecycle: {
            created: function created() {
                this._div = document.createElement('div');
                this._div.setAttribute('class','form-input input-full-width');

                this._eraser = document.createElement('x-eraser');
                this._div.appendChild(this._eraser);

                this._input = document.createElement('input');
                this._input.type = 'text';
                this._div.appendChild(this._input);

                this.appendChild(this._div);
            },
            inserted: function inserted() {
            },
            removed: function removed() {
            },
            attributeChanged: function attributedChanged(attribute) {
                if('defaultFilter' === attribute) {
                    this._input.value = this.getAttribute('defaultFilter');
                }
            }
        },
        events : {
            'keyup': function (e) {
                e.stopPropagation();
                e.preventDefault();
                this.onFilterUpdate();
            },
            click : function(e) {
                e.stopPropagation();
                e.preventDefault();
            },
            erased: function() {
                if('' !== this._input.value) {
                    this._input.value = '';
                    this.onFilterUpdate();  
                }
            }
        },
        methods: {
            onFilterUpdate: function onFilterUpdate() {
                var event = new CustomEvent('filter', {
                    'detail': {
                        'column': this.getAttribute('column'),
                        filterValue: this._input.value
                    },
                    'bubbles': true,
                    'cancelable': false
                });
                this.dispatchEvent(event);
            }
        }
    });
})();

},{"inativ-x-eraser":3}],3:[function(require,module,exports){
(function (xtag) {
    xtag.register('x-eraser', {
        lifecycle: {
            created: function created() {
                this._eraser = document.createElement('div');
                this._eraser.setAttribute('class','eraser');
                this.appendChild(this._eraser);
            },
            inserted: function inserted() {
            },
            removed: function removed() {
            },
            attributeChanged: function attributedChanged(attribute) {

            }
        },
        events : {
            click : function(e) {
                e.stopPropagation();
                e.preventDefault();
                var evt = new CustomEvent('erased', {
                    'bubbles': true
                });
                this.dispatchEvent(evt);
            }
        }
    });

}(xtag));
},{}],4:[function(require,module,exports){
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
                if(!this._editors[cell.cellIndex]) {
                    return;
                }
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

},{"inativ-x-datagrid":1}]},{},[4])
;