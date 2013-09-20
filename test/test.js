var TestSuite = require('spatester').TestSuite;
var datagrid, cellEditor;

var testSuite = new TestSuite("inativ-x-cell-editor test", {
    setUp: function () {
        datagrid = document.createElement('x-datagrid');
        datagrid.setAttribute('id', "datagrid");
        datagrid.setAttribute('cell-height', 20);
        datagrid.setAttribute('cell-width', 100);
        datagrid.setAttribute('filter', false);
        cellEditor = document.createElement('x-cell-editor');

        document.querySelector('body').appendChild(datagrid);
        datagrid.registerPlugin(cellEditor);

        var datagridContent = [
            [
                {value: "A1"},
                {value: "B1"},
                {value: "C1"}
            ],
            [
                {value: "A2"},
                {value: "B2"},
                {value: "C2"}
            ]
        ];
        datagrid.data = {
            colHeader: [
                [
                    {value: 'column1', editor: function () {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'text');
                        input.affectValue = function (value) {
                            this.value = value;
                        };
                        input.getValue = function () {
                            return this.value;
                        };
                        return input;
                    }},
                    {value: 'column2'},
                    {value: 'column3'}
                ]
            ],
            content: datagridContent
        };

        datagrid.addEventListener('cellChanged', function (e) {
            var cell = e.detail.cell;
            datagridContent[cell.cellRow][cell.cellIndex].value = e.detail.newValue;
            datagrid.content = datagridContent;
        });
    },

    tearDown: function () {
        var datagrid = document.querySelector('x-datagrid');
        // TODO problème ie9
        //datagrid.removeEventListener('cellChanged');
        document.body.removeChild(datagrid);
    }
});

Testem.useCustomAdapter(function(socket) {
    testSuite.setSocket(socket);
});

testSuite.addTest("Affichage de l'edition sur un double click", function(scenario, asserter) {
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");

    asserter.assertTrue(function() {
        return cellEditor.style.display !== 'none';
    }, 'On doit avoir un cell editor visible');

    asserter.assertTrue(function () {
        var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");
        return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
    }, 'Le cell editor doit se superposer à la cellule sur laquelle on a double-cliqué');
});

testSuite.addTest("On ne peut n'avoir qu'une cellule en édition", function (scenario, asserter) {
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)")
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");

    asserter.assertTrue(function () {
        return asserter.count('x-cell-editor')() === 1;
    }, 'On doit avoir un cell editor visible');
});

testSuite.addTest("Comportement du click outside", function (scenario, asserter) {
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");

    asserter.assertTrue(function () {
        return cellEditor.style.display !== 'none';
    }, 'Le cell editor doit apparaître');

    var expectedValue = "toto";
    scenario.exec(function() {
        document.querySelector('x-cell-editor input').value = expectedValue;
    }).click("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");

    asserter.assertNodeContains("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)", expectedValue,
        'La valeur saisie doit se retrouver dans la cellule');

    asserter.assertTrue(function () {
        return cellEditor.style.display === 'none';
    }, 'Le cell editor ne doit plus apparaître');
});

testSuite.addTest("Comportement de la touche escape", function (scenario, asserter) {

});

testSuite.addTest("Comportement de la touche entrée", function (scenario, asserter) {

});

testSuite.addTest("Comportement des touches de navigation", function (scenario, asserter) {
    //TODO A faire
});

document.addEventListener('DOMComponentsLoaded', function(){
    testSuite.run();
});