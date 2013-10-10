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

testSuite.addTest("On ne peut avoir qu'une cellule en édition", function(scenario, asserter) {
    // When
    scenario.wait('x-cell-editor')
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)")
        .dblclick("x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)");

    // Then
    asserter.expect('x-cell-editor').to.have.nodeLength(1);
});

testSuite.addTest("Comportement du click outside", function(scenario, asserter) {
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

testSuite.addTest("Un click sur une cellule en édition ne doit rien faire", function(scenario, asserter) {
    // Given
    var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
    scenario.wait('x-cell-editor')
        .dblclick(cellSelector);

    // When
    scenario.click(cellSelector);

    // Then
    asserter.expect('x-cell-editor').to.be.visible();
    asserter.expect('[focus]').not.to.exist();
    asserter.expect('x-datagrid').to.returnTrue(assertCellEditorIsAboveCell(1, 2), "L'editeur doit être positionné sur la cellule en édition");
});

// testSuite.addTest("Quand on sort du mode édition avec un click, la cellule clickée prend le focus et le changement est pris en compte", function(scenario, asserter) {
//     if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
//         // Given
//         var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(3)";
//         var nextCellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
//         scenario.wait('x-cell-editor').dblclick(cellSelector);
//         var newValue = "new value";

//         // When
//         scenario.exec(function() {
//             document.querySelector('x-cell-editor input').value = newValue;
//         }).click(nextCellSelector);

//         // Then
//         asserter.expect(nextCellSelector).to.have.attr('focus');
//         asserter.expect(cellSelector).to.have.html(newValue);
//     }
// });