testSuite.addTest("Comportement de la touche escape en mode édition", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        scenario.wait('x-cell-editor')
            .dblclick(cellSelector);
        var unExpectedValue = "toto";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = unExpectedValue;
        }).keyboard('x-cell-editor', 'keydown', 'Esc', 27);

        // Then
        asserter.expect(cellSelector).not.to.have.value(unExpectedValue);
        asserter.expect('x-cell-editor').to.be.hidden();
    }
});

testSuite.addTest("Comportement de la touche entrée en mode édition", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        var expectedValue = "toto";
        scenario.wait('x-cell-editor')
            .dblclick(cellSelector)
            .exec(function() {
                document.querySelector('x-cell-editor input').value = expectedValue;
            });

        // When
        scenario.keyboard('x-cell-editor', 'keydown', 'Enter', 13);

        // Then
        asserter.expect(cellSelector).to.have.html(expectedValue);
        asserter.expect('x-cell-editor').to.be.hidden();
    }
});


testSuite.addTest("Quand on appuie sur F2, la cellule qui a le focus passe en mode edition", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) {
        scenario.wait('x-datagrid');
        asserter.expect('[focus]').to.exist();

        // When
        scenario.keyboard('x-datagrid', 'keydown', 113, 113);

        // Then
        asserter.expect('[focus]').not.to.exist();
        asserter.expect('x-cell-editor').to.be.visible();
        asserter.expect('x-datagrid').to.returnTrue(assertCellEditorIsAboveCell(1, 2), "L'editeur doit être positionné sur la cellule en édition");
    }
});


testSuite.addTest("Quand on appuie sur Enter, la cellule qui a le focus passe en mode edition", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) {
        scenario.wait('x-datagrid');
        asserter.expect('[focus]').to.exist();

        // When
        scenario.keyboard('x-datagrid', 'keydown', 13, 13);

        // Then
        asserter.expect('[focus]').not.to.exist();
        asserter.expect('x-cell-editor').to.be.visible();
        asserter.expect('x-datagrid').to.returnTrue(assertCellEditorIsAboveCell(1, 2), "L'editeur doit être positionné sur la cellule en édition");
    }
});


testSuite.addTest("Quand on sort du mode édition avec Echap, l'ancienne cellule reprend le focus et le changement n'est pas pris en compte", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        scenario.wait('x-cell-editor')
            .dblclick(cellSelector);
        var unExpectedValue = "tata";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = unExpectedValue;
        }).keyboard('x-cell-editor', 'keydown', 'Esc', 27);

        // Then
        asserter.expect(cellSelector).to.have.attr('focus');
        asserter.expect(cellSelector).to.have.html("toto");
    }
});

testSuite.addTest("Quand on sort du mode édition avec Enter, la celulle du bas prend le focus et le changement est pris en compte", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        var nextCellSelector = "x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)";
        scenario.wait('x-cell-editor')
            .dblclick(cellSelector);
        var newValue = "new value";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = newValue;
        }).keyboard('x-cell-editor', 'keydown', 'Enter', 13);

        // Then
        asserter.expect(nextCellSelector).to.have.attr('focus');
        asserter.expect(cellSelector).not.to.have.attr('focus');
        asserter.expect(cellSelector).to.have.html(newValue);
    }
});



testSuite.addTest("Quand on sort du mode édition avec TAB, la cellule de droite prend le focus et le changement est pris en compte", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        var nextCellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(3)";
        scenario.wait('x-cell-editor').dblclick(cellSelector);
        var newValue = "new value";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = newValue;
        }).keyboard('x-cell-editor', 'keydown', 'Tab', 9);

        // Then
        asserter.expect(nextCellSelector).to.have.attr('focus');
        asserter.expect(cellSelector).to.have.html(newValue);
    }
});

testSuite.addTest("Quand on sort du mode édition avec TAB, et que l'on est sur la dernière cellule éditable d'une ligne la 1ère cellule éditable de la ligne suivante prend le focus", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(3)";
        var nextCellSelector = "x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)";
        scenario.wait('x-cell-editor').dblclick(cellSelector);
        var newValue = "new value";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = newValue;
        }).keyboard('x-cell-editor', 'keydown', 'Tab', 9);

        // Then
        asserter.expect(nextCellSelector).to.have.attr('focus');
        asserter.expect(cellSelector).to.have.html(newValue);
    }
});

testSuite.addTest("Quand on sort du mode édition avec SHIFT+TAB, et que l'on est sur la première cellule éditable d'une ligne la dernière cellule éditable de la ligne précédente prend le focus", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(2) td:nth-child(2)";
        var nextCellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(3)";
        scenario.wait('x-cell-editor').dblclick(cellSelector);
        var newValue = "new value";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = newValue;
        }).keyboard('x-cell-editor', 'keydown', 'Tab', 9, true);

        // Then
        asserter.expect(nextCellSelector).to.have.attr('focus');
        asserter.expect(cellSelector).to.have.html(newValue);
    }
});

testSuite.addTest("Quand on sort du mode édition avec SHIFT+TAB, la cellule de gauche prend le focus et le changement est pris en compte", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // Given
        var cellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(3)";
        var nextCellSelector = "x-datagrid .contentWrapper table tr:nth-child(1) td:nth-child(2)";
        scenario.wait('x-cell-editor').dblclick(cellSelector);
        var newValue = "new value";

        // When
        scenario.exec(function() {
            document.querySelector('x-cell-editor input').value = newValue;
        }).keyboard('x-cell-editor', 'keydown', 'Tab', 9, true);

        // Then
        asserter.expect(nextCellSelector).to.have.attr('focus');
        asserter.expect(cellSelector).to.have.html(newValue);
    }
});


testSuite.addTest("Comportement de la touche tabulation en mode focus", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // When
        scenario.wait('x-datagrid');
        scenario.keyboard("body", 'keydown', 9, 9); // et hop, on part à droite 

        // Then
        var editedCellSelector = ("x-datagrid .contentWrapper table tr:first-child td:nth-child(3)");
        asserter.expect(editedCellSelector).to.have.attr('focus');
    }
});

testSuite.addTest("Comportement de la flcèhe droite en mode focus", function(scenario, asserter) {
    if (scenario.keyboardNoChromeNoIE()) { //FIXME je suis trop malheureux de pas pouvoir tester dans IE et Chrome ( et je parle meme pas de safariri )
        // When
        scenario.wait('x-datagrid');
        scenario.keyboard("body", 'keydown', 39, 39); // et hop, on part à droite 

        // Then
        var editedCellSelector = ("x-datagrid .contentWrapper table tr:first-child td:nth-child(3)");
        asserter.expect(editedCellSelector).to.have.attr('focus');
    }
});
