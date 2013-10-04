var TestSuite = require('spatester');
var datagrid, 
    cellEditor,
    datagridContent = [
        [
            {value: "_1"},
            {value: "A1"},
            {value: "B1"},
            {value: "C1"}
        ],
        [
            {value: "_2"},
            {value: "A2"},
            {value: "B2"},
            {value: "C2"}
        ]
    ];

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
        datagrid.data = {
            colHeader: [
                [
                    {value: 'column0'},
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

function assertCellEditorIsAboveCell(rowIndex, colIndex) {
    return function() {
        var editedCell = document.querySelector("x-datagrid .contentWrapper table tr:nth-child(" + rowIndex + ") td:nth-child(" + colIndex + ")");
        return cellEditor.style.left === (editedCell.offsetLeft)+"px" && cellEditor.style.top === editedCell.offsetTop+"px";  
    };
}

testSuite.addTest("Affichage de l'edition sur un double click", function(scenario, asserter) {
    // Given
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)");


    // Then
    asserter.expect('x-cell-editor').to.be.visible();
    asserter.expect('[focus]').not.to.exist();
    asserter.expect('x-datagrid').to.returnTrue(assertCellEditorIsAboveCell(1, 2), "L'editeur doit être positionné sur la cellule en édition");
});

testSuite.addTest("un double click sur une cellule non éditable ne fait rien", function(scenario, asserter) {
    // When
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(4)");

    // Then
    asserter.expect('x-cell-editor').to.be.hidden();
});

testSuite.addTest("On ne peut avoir qu'une cellule en édition", function (scenario, asserter) {
    // When
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)")
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");

    // Then
    asserter.expect('x-cell-editor').to.have.nodeLength(1);
});

testSuite.addTest("Comportement du click outside", function (scenario, asserter) {
    // Given
    var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
    scenario.wait('x-cell-editor')
        .dblclick(cellSelector);
    var expectedValue = "toto";

    asserter.expect('x-cell-editor').to.be.visible();

    // When
    scenario.exec(function() {
        document.querySelector('x-cell-editor input').value = expectedValue;
    }).click("x-datagrid");

    // Then
    asserter.expect(cellSelector).to.have.html(expectedValue);
    asserter.expect('x-cell-editor').to.be.hidden();
});

testSuite.addTest("Comportement de la touche escape", function (scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        scenario.wait('x-cell-editor')
            .dblclick(cellSelector);
        var unExpectedValue = "toto";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = unExpectedValue;
        }).keyboard('x-cell-editor', 'keyup', 'Esc',  27);

        // Then
        asserter.expect(cellSelector).not.to.have.value(unExpectedValue);
        asserter.expect('x-cell-editor').to.be.hidden();
    }
});

testSuite.addTest("Comportement de la touche entrée", function (scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()){ //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        var expectedValue = "toto";
        scenario.wait('x-cell-editor')
            .dblclick(cellSelector)
            .exec(function() {
                document.querySelector('x-cell-editor input').value = expectedValue;
            });

        // When
        scenario.keyboard('x-cell-editor', 'keyup', 'Enter',  13);

        // Then
        asserter.expect(cellSelector).to.have.html(expectedValue);
        asserter.expect('x-cell-editor').to.be.hidden();
    }
});

testSuite.addTest("La 1ère cellule éditable doit avoir le focus", function(scenario, asserter) {
    scenario.wait('x-datagrid');

    var firstEditableCellSelector = "x-datagrid .contentWrapper table tr:first-child td:nth-child(2)";

    asserter.expect(firstEditableCellSelector).to.have.attr('focus');
});

testSuite.addTest("Le click sur une cellule editable doit lui donner le focus", function(scenario, asserter) {
    scenario.wait('x-datagrid');

    // Given
    var firstEditableCellSelector = "x-datagrid .contentWrapper table tr:first-child td:nth-child(2)";
    var otherEditableCellSelector = "x-datagrid .contentWrapper table tr:first-child td:nth-child(3)";

    // When
    scenario.click(otherEditableCellSelector);

    // Then
    asserter.expect(firstEditableCellSelector).to.not.have.attr('focus');
    asserter.expect(otherEditableCellSelector).to.have.attr('focus');
});

testSuite.addTest("Le click sur une cellule non editable ne doit pas lui donner le focus", function(scenario, asserter) {
    scenario.wait('x-datagrid');

    // Given
    var firstEditableCellSelector = "x-datagrid .contentWrapper table tr:first-child td:nth-child(2)";
    var otherNonEditableCellSelector = "x-datagrid .contentWrapper table tr:first-child td:nth-child(4)";

    // When
    scenario.click(otherNonEditableCellSelector);

    // Then
    asserter.expect(otherNonEditableCellSelector).to.not.have.attr('focus');
    asserter.expect(firstEditableCellSelector).to.have.attr('focus');
});

testSuite.addTest("Le focus doit être conservé après un changement du content du datagrid", function(scenario, asserter) {
    scenario.wait('x-datagrid');

    // Given
    var cell = "x-datagrid .contentWrapper table tr:first-child td:nth-child(2)";

    // When
    scenario.exec(function() {
        datagrid.content = datagridContent;
    });

    // Then
    asserter.expect(cell).to.have.attr('focus');

});

testSuite.addTest("Un click en dehors du tableau doit enlever le focus", function(scenario, asserter) {
    scenario.wait('x-datagrid');

    // When
    scenario.click('body');

    // Then
    asserter.expect('[focus]').not.to.exist();
});
testSuite.addTest("Un click en dehors du contenu tableau doit enlever le focus", function(scenario, asserter) {
    scenario.wait('x-datagrid');

    // When
    scenario.click('x-datagrid .columnHeaderWrapper');

    // Then
    asserter.expect('[focus]').not.to.exist();
});


testSuite.addTest("Quand on appuie sur F2, la cellule qui a le focus passe en mode edition", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) {
        scenario.wait('x-datagrid');
        asserter.expect('[focus]').to.exist();

        // When
        scenario.keyboard('x-datagrid', 'keypress', 113, 113);

        // Then
        asserter.expect('[focus]').not.to.exist(); 
        asserter.expect('x-cell-editor').to.be.visible();
        asserter.expect('x-datagrid').to.returnTrue(assertCellEditorIsAboveCell(1, 2), "L'editeur doit être positionné sur la cellule en édition");
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