export class BoardState {
    constructor ( matrixState = [ [ '', '', '' ], [ '', '', '' ], [ '', '', '' ] ] ) {
        this.matrixState = matrixState;
        this.emptyCells = 9;
    }
    setCellValue ( { row, col } = {}, newValue ) {
        if ( newValue == null ) {
            newValue == '';
        }
        
        this.matrixState[row][col] = newValue;
  
        if ( newValue != null && newValue !== '' ) {
            this.reduceEmptyCells();

        } else {
            this.increaseEmptyCells();
        }
    }
    resetCellValue ( coords = { row, col } ) {
        this.setCellValue( coords, '' );
    }
    getCellValue ( { row, col } = {} ) {
        return this.matrixState[row][col];
    }
    isCellEmpty ( coords = { row, col } ) {
        return this.getCellValue( coords ) === '';
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount;
    }
    reduceEmptyCells () {
        if ( this.emptyCells > 0 ) {
            this.setEmptyCells( this.emptyCells - 1 );
        }
    }
    increaseEmptyCells () {
        if ( this.emptyCells < 9 ) {
            this.setEmptyCells( this.emptyCells + 1 );
        }
    }
    hasEmptyCells () {
        return this.emptyCells > 0;
    }
    hasEnoughFilledCells () {
        return this.emptyCells < 5;
    }
    findWinningMarkInLine ( cellCoords = [] ) {
        let cellValue1 = this.getCellValue( { row: cellCoords[0][0], col: cellCoords[0][1] } );
        let cellValue2 = this.getCellValue( { row: cellCoords[1][0], col: cellCoords[1][1] } );
        let cellValue3 = this.getCellValue( { row: cellCoords[2][0], col: cellCoords[2][1] } );

        return ( cellValue1 != null
              && cellValue1 !== ''
              && cellValue1 === cellValue2
              && cellValue2 === cellValue3 ) ? cellValue1
                                             : null;
    }
    findWinningMarkInCross ( { row, col } = {} ) {
        let dirArrays = { horizontal: [ [row, 0], [row, 1], [row, 2] ],
                          vertical:   [ [0, col], [1, col], [2, col] ] };

        return this.findWinningMarkInLine( dirArrays.horizontal )
            || this.findWinningMarkInLine( dirArrays.vertical );
    }
    findWinningMarkInDiagonalCross () {
        let dirArrays = { left:  [ [0, 0], [1, 1], [2, 2] ],
                          right: [ [0, 2], [1, 1], [2, 0] ] };

        return this.findWinningMarkInLine( dirArrays['left'] )
            || this.findWinningMarkInLine( dirArrays['right'] );
    }
    findWinningMarkInBoard ( latestCoords ) {
        return this.findWinningMarkInCross( latestCoords )
            || this.findWinningMarkInDiagonalCross();
    }
}