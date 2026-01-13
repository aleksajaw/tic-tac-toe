import { CellInDOM } from "./CellInDOM.js";

export class BoardInDOM {
    constructor ( stateBoard, stateGame ) {
        this.boardDOM = document.getElementById( 'gameBoard' );
        this.stateBoard = stateBoard;
        this.stateGame = stateGame;
        this.cells = [];
        this.generateBoard();
        this.moveGenerator = null;
    }
    setMoveGenerator ( obj ) {
        this.moveGenerator = obj
    }
    addCell ( cell ) {
        this.cells.push( cell );
    }
    resetBoardDOM () {
        if ( this.boardDOM.hasChildNodes() ) {
            this.boardDOM.innerHTML = '';
        }
    }
    createCellWithDOM ( cell, coords = { row, col } ) {
        cell = new CellInDOM( coords, this, this.stateBoard, this.stateGame );
        this.addCell( cell );
        this.boardDOM.appendChild( cell.HTMLNode );
    }
    generateBoard () {
        this.resetBoardDOM();
        let cell = null;
    
        for ( let row = 0; row < 3; row++ ) {
            for ( let col = 0; col < 3; col++ ) {

                let coords = { row, col };
                this.createCellWithDOM( cell, coords );
            }
        }
    }
    toggleCellsDisabled ( { force = false } = {} ) {
        this.cells.forEach( (cell) => {

            let disabledState = ( !cell.isEmpty() || force );
            cell.setDisabled( disabledState );
        } );
    }
    clickSpecificCell ( { row, col } = {} ) {
        let targetCell = this.cells.find( cell => ( parseInt(cell.getDataSet().row) === row
                                                 && parseInt(cell.getDataSet().col) === col ) );
        if ( targetCell ) {
            targetCell.HTMLNode.click();
        }
    }
}