class GameState {
    constructor () {
        this.loading = false;
        this.playersInfo = [
            {
                id: 1,
                name: 'player 1',
                mark: 'X'
            },
            {   id: 2,
                name: 'computer',
                mark: 'O',
                isBot: true
            }
        ]
        this.whoseTurn = {  id: this.playersInfo[0].id,
                            mark: this.playersInfo[0].mark };
        this.latestPosition = { row: null, col: null };
        this.winner = null;
        this.currentGameMessage = ''
        this.gameInfoContainer = document.getElementById('gameInfo');
    }
    setLoading ( bool ) {
        this.loading = bool
    }
    setWhoseTurn ( info = { id: null, mark: null } ) {
        this.whoseTurn = info;
    }
    setCurrentGameMessage ( text ) {
        this.currentGameMessage = text
    }
    setWinner ( id ) {
        this.winner = id
    }
    setLatestPosition ( coords = { row, col } ) {
        this.latestPosition = coords;
    }
    // WHOSE TURN
    changeTurn () {
        let player = this.playersInfo.find( el => el.id !== this.whoseTurn.id );
        let newTurn = { id: player.id, mark: player.mark };

        this.setWhoseTurn( newTurn );
        this.changeCurrentGameMessage();
    }
    updateGameInfoContainer ( text ) {
        text = text.replace(/\n/g, '<br>');
        this.gameInfoContainer.innerHTML = text;
    }
    changeCurrentGameMessage () {
        let futureMessage = ( this.winner !== null )
                              ? 'The winner is: ' + this.playersInfo.find(el => el.id === this.winner).name + '.\n'
                              : '';

        futureMessage += ( this.whoseTurn.id !== null )
                              ? "We're waiting for: " + this.playersInfo.find(el => el.id === this.whoseTurn.id).name
                              : 'Click "Reset\u00A0game" to\u00A0play\u00A0again.';
        
        this.setCurrentGameMessage( futureMessage );
        this.updateGameInfoContainer( this.currentGameMessage );
        console.log( this.currentGameMessage );
    }
    findMarkOwner ( mark ) {
        let owner = this.playersInfo.find( el => el.mark === mark );
        return owner ? owner.id : null;
    }
    hasWinner ( board ) {
        let winnerMark = board.checkMarksInBoard( this.latestPosition);
        this.setWinner( this.findMarkOwner(winnerMark) );
        return this.winner !== null;
    }
}



class BoardState {
    constructor ( matrixState = [ [ '', '', '' ], [ '', '', '' ], [ '', '', '' ] ] ) {
        this.matrixState = matrixState;
        this.emptyCells = 9;
    }
    setCellValue ( { row, col }, newValue ) {
        this.matrixState[row][col] = newValue;
    }
    getCellValue ( { row, col } ) {
        return this.matrixState[row][col]
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount
    }
    checkMarksInLine ( cellCoords = new Array(3) ) {
        let cellValue1 = this.getCellValue( { row: cellCoords[0][0], col: cellCoords[0][1] } );
        let cellValue2 = this.getCellValue( { row: cellCoords[1][0], col: cellCoords[1][1] } );
        let cellValue3 = this.getCellValue( { row: cellCoords[2][0], col: cellCoords[2][1] } );

        return ( cellValue1 != null
              && cellValue1 === cellValue2
              && cellValue2 === cellValue3 ) ? cellValue1
                                             : null
    }
    checkMarksInCross ( { row, col } ) {
        let dirArrays = { horizontal: [ [row, 0], [row, 1], [row, 2] ],
                          vertical:   [ [0, col], [1, col], [2, col] ] };

        return this.checkMarksInLine( dirArrays.horizontal )
            || this.checkMarksInLine( dirArrays.vertical );
    }
    checkMarksInDiagonalCross () {
        let dirArrays = { left:  [ [0, 0], [1, 1], [2, 2] ],
                          right: [ [0, 2], [1, 1], [2, 0] ] };

        return this.checkMarksInLine( dirArrays['left'] )
            || this.checkMarksInLine( dirArrays['right'] );
    }
    checkMarksInBoard ( latestPosition ) {
        return this.checkMarksInCross( latestPosition )
            || this.checkMarksInDiagonalCross();
    }
}



class CellInDOM {
    constructor ( { row, col }, parentBoardDOM, parentBoardState, gameState ) {
        this.parentBoardDOM = parentBoardDOM;
        this.parentBoardState = parentBoardState;
        this.gameState = gameState;

        this.HTMLNode = Object.assign( document.createElement('input'), {
            type: 'text',
            className: 'cell',
            readOnly: true
        } );

        this.setDatasetAndAria( { row, col } );

        this.HTMLNode.addEventListener( 'click', () => {
            this.updateOnClick( { row, col } )
        } );
    }
    setValue ( val ) {
        this.HTMLNode.value = val
    }
    getValue () {
        return this.HTMLNode.value
    }
    setDisabled ( bool ) {
        this.HTMLNode.disabled = bool
    }
    setDatasetAndAria ( { row, col } ) {
        Object.assign( this.HTMLNode.dataset, { row: row, col: col } );
        this.HTMLNode.ariaLabel = `Cell in row ${row + 1}, column ${col + 1}`;
    }
    updateOnClick( { row, col } ) {
        this.setValue( this.gameState.whoseTurn.mark );
        this.setDisabled( true );
        this.parentBoardState.setCellValue( { row, col }, this.gameState.whoseTurn.mark );
        this.parentBoardState.setEmptyCells( this.parentBoardState.emptyCells - 1 );
        this.gameState.setLatestPosition( { row, col } );

        // 9 fields  -  2 players  *  2 moves  =  5 empty cells
        // HAS WINNER OR TIE
        if ( ( this.parentBoardState.emptyCells < 5 ) && ( this.gameState.hasWinner(this.parentBoardState) || !this.parentBoardState.emptyCells ) ){

                this.parentBoardDOM.toggleCellsDisabled(true);
                this.gameState.setWhoseTurn();
                this.gameState.changeCurrentGameMessage();

        } else {
            // BOT MOVE
            if ( this.gameState.whoseTurn.mark !== this.gameState.playersInfo[1].mark && this.gameState.playersInfo[1].isBot ) {
                
                this.parentBoardDOM.toggleCellsDisabled(true);
                this.gameState.changeTurn();
                this.gameState.setLoading(true);

                setTimeout( () => {
                    this.parentBoardDOM.toggleCellsDisabled();
                    botMoveObj.botMove(this.parentBoardDOM, this.gameState);
                    this.gameState.setLoading(false);
                }, 1000 );

            // JUST CHANGE MARKS
            // FOR 2 PLAYERS GAME (without bot)
            } else this.gameState.changeTurn();
        }
    }
}



class BoardInDOM {
    constructor ( boardState, gameState ) {
        this.boardDOM = document.getElementById('gameBoard');
        this.boardState = boardState;
        this.gameState = gameState;
        this.cells = []
        this.generateBoard();
    }
    addCell ( cell ) {
        this.cells.push( cell );
    }
    resetBoardDOM () {
        if ( this.boardDOM.hasChildNodes() )
            this.boardDOM.innerHTML = '';
    }
    generateBoard () {
        this.resetBoardDOM();
        let cell = null;
    
        for ( let row = 0; row < 3; row++ ) {
    
            for ( let col = 0; col < 3; col++ ) {
                
                cell = new CellInDOM( { row, col }, this, this.boardState, this.gameState );
                this.addCell( cell );
                this.boardDOM.appendChild( cell.HTMLNode );
            }
        }
    }
    toggleCellsDisabled ( force = false ) {
        this.cells.forEach( (cell) => {

          let disabledState = (cell.getValue() !== '' || force );
          cell.setDisabled( disabledState );
        } );
    }
    clickSpecificCell ( { row, col } ) {
        let targetCell = this.cells.find( cell => ( parseInt(cell.HTMLNode.dataset.row) === row
                                                 && parseInt(cell.HTMLNode.dataset.col) === col ) );
        if ( targetCell ) targetCell.HTMLNode.click();
    }
}



class BotMoveBase {
    constructor ( boardDOM, boardState, gameState ) {
        this.botMoveScores = {
            [gameState.playersInfo[0].id]: -10,
            [gameState.playersInfo[1].id]: 10,
            tie: 0
        };
        this.boardDOM = boardDOM;
        this.boardState = boardState;
        this.gameState = gameState
    }
    // LET'S MAKE THE BOT MOVES!
    botMove () {
        let bestMoveScore = -Infinity;
        let movesArray = []

        for ( let row = 0; row < 3; row++ ) {

            for ( let col = 0; col < 3; col++ ) {

                if ( !this.boardState.getCellValue( { row, col } ) ) {
                    
                    this.boardState.setCellValue( { row, col }, this.gameState.playersInfo[1].mark );
                    this.gameState.setLatestPosition( { row, col } );

                    let moveScore = this.miniMax( false );

                    this.boardState.setCellValue( { row, col }, '' );

                    if ( moveScore == bestMoveScore ) {
                        movesArray.push( { row, col } );

                    } else if ( moveScore > bestMoveScore ) {
                        movesArray = []
                        movesArray.push( { row, col } );
                        bestMoveScore = moveScore;
                    }
                }
            }
        }
        console.log(movesArray)
        // add some randomness
        let randomPossibleMove = movesArray[Math.floor(Math.random() * movesArray.length)];

        this.boardState.setCellValue( randomPossibleMove, this.gameState.playersInfo[1].mark );
        this.boardDOM.clickSpecificCell( randomPossibleMove );
    }
    // MINIMAX ALGORITHM
    miniMax ( isMaximizing ) {

        let result = this.checkOptionalWin();
        let bestMoveScore = -Infinity;

        if ( result !== null )
            return this.botMoveScores[result];
        
        if ( isMaximizing ) {

            for ( let row = 0; row < 3; row++ ) {

                for ( let col = 0; col < 3; col++ ) {

                    if ( !this.boardState.getCellValue( { row, col } ) ) {

                        this.boardState.setCellValue( { row, col }, this.gameState.playersInfo[1].mark );
                        this.gameState.setLatestPosition( { row, col } );

                        let moveScore = this.miniMax( false );

                        this.boardState.setCellValue( { row, col }, '' );

                        bestMoveScore = Math.max( moveScore, bestMoveScore );
                    }
                }
            }

        } else {

            bestMoveScore = Infinity;

            for ( let row = 0; row < 3; row++ ) {

                for ( let col = 0; col < 3; col++ ) {
                    
                    if ( !this.boardState.getCellValue( { row, col } ) ) {

                        this.boardState.setCellValue( { row, col }, this.gameState.playersInfo[0].mark );
                        this.gameState.setLatestPosition( { row, col } );

                        let moveScore = this.miniMax( true );

                        this.boardState.setCellValue( { row, col }, '' );

                        bestMoveScore = Math.min( moveScore, bestMoveScore );
                    }
                }
            }
        }
        return bestMoveScore;
    }
    // HELPER FOR MINIMAX ALGORITHM
    checkOptionalWin () {

        let optionalWinner = null;
        let optionalEmptyCells = 0;

        if ( this.boardState.checkMarksInBoard( this.gameState.latestPosition ) ) {

            let latestCoords = this.gameState.latestPosition;
            let optionalCellValue = this.boardState.getCellValue( { row: latestCoords.row, col: latestCoords.col } );
            optionalWinner = this.gameState.findMarkOwner(optionalCellValue);
        }

        // get empty cells
        for ( let row = 0; row < 3; row++ ) {

            for ( let col = 0; col < 3; col++ ) {
                
                if ( !this.boardState.getCellValue( { row, col } ) ) optionalEmptyCells = optionalEmptyCells + 1;
            }
        }
        
        return ( !optionalWinner && !optionalEmptyCells )
            ? 'tie'
            : optionalWinner;
    }
}


let ticTacToe = null;
let gameBoardState = null;
let gameBoardDOM = null;
let botMoveObj = null;



function initGame () {

    if ( ticTacToe === null || !ticTacToe.loading ) {

        ticTacToe = new GameState();
        ticTacToe.setLoading(true);

        gameBoardState = new BoardState();
        gameBoardDOM = new BoardInDOM(gameBoardState, ticTacToe);

        botMoveObj = new BotMoveBase(gameBoardDOM, gameBoardState, ticTacToe);

        ticTacToe.changeCurrentGameMessage();
        ticTacToe.setLoading(false);
    }
}


document.addEventListener('DOMContentLoaded',  () => {

    initGame();
    document.getElementById('gameReset').addEventListener( 'click', () => initGame() );
})
