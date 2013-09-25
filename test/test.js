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
                    {value: 'column2', editor: function () {
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

testSuite.addTest("un double click sur une cellule non éditable ne fait rien", function(scenario, asserter) {
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(3)");

    asserter.assertFalse(function() {
        return cellEditor.style.display !== 'none';
    }, 'On ne doit pas avoir un cell editor visible');
});

testSuite.addTest("On ne peut avoir qu'une cellule en édition", function (scenario, asserter) {
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
    if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");

        var unExpectedValue = "toto";
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = unExpectedValue;
        }).keyboard('x-cell-editor', 'keyup', 'Esc',  27);

        asserter.assertNodeNotContains("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)", unExpectedValue,
            'La valeur saisie ne doit pas être conservé après échappement');

        asserter.assertTrue(function () {
            return cellEditor.style.display === 'none';
        }, 'Le cell editor doit disparaître');
    }
});

testSuite.addTest("Comportement de la touche entrée", function (scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        scenario.wait('x-cell-editor')
            .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");

        var expectedValue = "toto";
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = expectedValue;
        }).keyboard('x-cell-editor', 'keyup', 'Enter',  13);

        asserter.assertNodeContains("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)", expectedValue,
            'La valeur saisie doit être ' + expectedValue );

        asserter.assertTrue(function () {
            return cellEditor.style.display === 'none';
        }, 'Le cell editor doit disparaître');
    }
});

// testSuite.addTest("Comportement de la touche tabulation", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");

//         var expectedValue = "toto";
//         scenario.exec(function() {
//             document.querySelector('x-cell-editor input').value = expectedValue;
//         }).keyboard('x-cell-editor', 'keyup', 9,  9); // et hop, on tabule et on part à droite

//         asserter.assertNodeContains("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)", expectedValue,
//             'La valeur saisie doit être ' + expectedValue );

//         asserter.assertFalse(function () {
//             return cellEditor.style.display === 'none';
//         }, 'Le cell editor doit être présent');
//     }
// });

// testSuite.addTest("Comportement de la touche flèche droite", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a double-cliqué');

//         scenario.keyboard('x-cell-editor', 'keyup', 39,  39); // et hop, on part en haut

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule de droite');
//     }
// });

// testSuite.addTest("Comportement de la touche flèche haut", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a double-cliqué');

//         scenario.keyboard('x-cell-editor', 'keyup', 38,  38); // et hop, on part en haut

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule du dessus');
//     }
// });

// testSuite.addTest("Comportement de la touche flèche bas", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a double-cliqué');

//         scenario.keyboard('x-cell-editor', 'keyup', 40,  40); // et hop, on part en bas

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule du dessus');
//     }
// });

// testSuite.addTest("Comportement de la touche tabulation : apres modif sur une cellule, puis tab, l'input est sur la cellule suivante", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");

//         var expectedValue = "toto";
//         scenario.exec(function() {
//             document.querySelector('x-cell-editor input').value = expectedValue;
//         }).keyboard('x-cell-editor', 'keyup', 9,  9); // et hop, on tabule et on part à droite

//         asserter.assertNodeContains("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)", expectedValue,
//             'La valeur saisie doit être ' + expectedValue );

//         asserter.assertFalse(function () {
//             return cellEditor.style.display === 'none';
//         }, 'Le cell editor doit être présent');

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a tabulé');
//     }
// });

// testSuite.addTest("Comportement de la touche shift+tabulation : apres modif sur une cellule, puis shift+tab, l'input est sur la cellule précédente", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");

//         var expectedValue = "toto";
//         scenario.exec(function() {
//             document.querySelector('x-cell-editor input').value = expectedValue;
//         }).keyboard('x-cell-editor', 'keyup', 9,  9, true); // et hop, on tabule et on part à gauche

//         asserter.assertNodeContains("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)", expectedValue,
//             'La valeur saisie doit être ' + expectedValue );

//         asserter.assertFalse(function () {
//             return cellEditor.style.display === 'none';
//         }, 'Le cell editor doit être présent');

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a tabulé');
//     }
// });

// testSuite.addTest("Comportement de la touche flèche gauche : apres modif sur une cellule, puis flèche gauche, l'input est sur la cellule précédente", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");

//         var expectedValue = "toto";
//         scenario.exec(function() {
//             document.querySelector('x-cell-editor input').value = expectedValue;
//         }).keyboard('x-cell-editor', 'keyup', 37,  37, true); // et hop, on part à gauche

//         asserter.assertNodeContains("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)", expectedValue,
//             'La valeur saisie doit être ' + expectedValue );

//         asserter.assertFalse(function () {
//             return cellEditor.style.display === 'none';
//         }, 'Le cell editor doit être présent');

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(1)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a tabulé');
//     }
// });


// testSuite.addTest("Comportement de la touche tabulation : tab sur la dernière cellule éditable de la ligne, l'input reste sur la cellule courante", function (scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         scenario.wait('x-cell-editor')
//             .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");

//         scenario.keyboard('x-cell-editor', 'keyup', 9,  9); // et hop, on tabule et on part pas à droite

//         asserter.assertFalse(function () {
//             return cellEditor.style.display === 'none';
//         }, 'Le cell editor doit être présent');

//         asserter.assertTrue(function () {
//             var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");
//             return cellEditor.style.left === editedCell.offsetLeft+"px" && cellEditor.style.top === editedCell.offsetTop+"px";
//         }, 'Le cell editor doit se superposer à la cellule sur laquelle on a tabulé');
//     }
// });

document.addEventListener('DOMComponentsLoaded', function(){
    testSuite.run();
});