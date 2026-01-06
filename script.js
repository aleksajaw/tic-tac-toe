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
    setLatestPosition ( row, col ) {
        this.latestPosition = { row, col };
    }
    // WHOSE TURN
    changeTurn () {
        let player = this.playersInfo.find( el => el.id !== this.whoseTurn.id );
        let newTurn = { id: player.id, mark: player.mark };

        this.setWhoseTurn( newTurn );
        this.changeCurrentGameMessage();
    }
    updateGameInfoContainer ( text ) {
        this.gameInfoContainer.innerHTML = text;
    }
    changeCurrentGameMessage () {
        let futureMessage = ( this.winner !== null )
                              ? 'The winner is: ' + this.playersInfo.find(el => el.id === this.winner).name + '.<br/>'
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
    setCell ( row, col, newValue ) {
        this.matrixState[row][col] = newValue;
    }
    getCellValue ( row, col ) {
        return this.matrixState[row][col]
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount
    }
    checkMarksInLine ( cellCoords = new Array(3) ) {
        let cellValue1 = this.getCellValue( cellCoords[0][0], cellCoords[0][1] );
        let cellValue2 = this.getCellValue( cellCoords[1][0], cellCoords[1][1] );
        let cellValue3 = this.getCellValue( cellCoords[2][0], cellCoords[2][1] );

        return ( cellValue1 != null
              && cellValue1 === cellValue2
              && cellValue2 === cellValue3 ) ? cellValue1
                                             : null
    }
    checkMarksInCross ( { row, col } ) {
        return this.checkMarksInLine( [ [row, 0], [row, 1], [row, 2] ] )
            || this.checkMarksInLine( [ [0, col], [1, col], [2, col] ] );
    }
    checkMarksInDiagonalCross () {
        let dirArrays = { left: [ [0, 0], [1, 1], [2, 2] ],
                          right: [ [0, 2], [1, 1], [2, 0] ] };

        return this.checkMarksInLine( dirArrays['left'] )
            || this.checkMarksInLine( dirArrays['right'] );
    }
    checkMarksInBoard ( latestPosition ) {
        return this.checkMarksInCross( latestPosition )
            || this.checkMarksInDiagonalCross();
    }
    writeMatrixStateInConsole () {
        let boardRow = ''
        console.log(' ')
        for ( let row = 0; row < 3; row++ ) {
            boardRow = ''
            for ( let col = 0; col < 3; col++ ) {
                boardRow += this.matrixState[row][col] || ' '
                boardRow += ' '
            }
            console.log(boardRow)
        }
        console.log(' ')
    }
}



class CellInDOM {
    constructor ( row, col, parentBoard, gameState ) {
        this.HTMLNode = document.createElement('input');
        this.setNodeType( 'text' );
        this.addNodeClass( 'cell' );
        this.setNodeAttribute( 'cell-row', row );
        this.setNodeAttribute( 'cell-col', col );
        this.setNodeReadOnly( true );
        this.addNodeEvent( 'click', () => {
            this.updateOnClick( this.getNodeAttribute('cell-row'), this.getNodeAttribute('cell-col'), parentBoard, gameState )
        } );
    }
    setNodeType ( type ) {
        this.HTMLNode.type = type;
    }
    addNodeClass ( newClass ) {
        this.HTMLNode.classList.add( newClass );
    }
    getNodeAttribute ( attr ) {
        return this.HTMLNode.getAttribute( attr );
    }
    setNodeAttribute ( attr, val ) {
        this.HTMLNode.setAttribute( attr, val );
    }
    setNodeValue ( val ) {
        this.HTMLNode.value = val
    }
    setNodeDisabled ( bool ) {
        this.HTMLNode.disabled = bool
    }
    setNodeReadOnly ( bool ) {
        this.HTMLNode.readOnly = bool
    }
    addNodeEvent ( action, fn ) {
        this.HTMLNode.addEventListener( action , fn);
    }
    // FIRST ACTION
    updateOnClick( row, col, parentBoard, gameState ) {
        this.setNodeValue( gameState.whoseTurn.mark );
        this.setNodeDisabled( true );
        parentBoard.setCell( row, col, gameState.whoseTurn.mark );
        parentBoard.setEmptyCells( parentBoard.emptyCells - 1 );
        gameState.setLatestPosition( row, col );

        // 9 fields  -  2 players  *  2 moves  =  5 empty cells
        // HAS WINNER OR TIE
        if ( ( parentBoard.emptyCells < 5 ) && ( gameState.hasWinner(parentBoard) || !parentBoard.emptyCells ) ){

                changeCellsAttr('disabled', '');
                gameState.setWhoseTurn();
                gameState.changeCurrentGameMessage();

        } else {
            // BOT MOVE
            if ( gameState.whoseTurn.mark !== gameState.playersInfo[1].mark && gameState.playersInfo[1].isBot ) {
                
                changeCellsAttr( 'disabled', '' );
                gameState.changeTurn();
                gameState.setLoading(true);
                setTimeout( () => {
                    changeCellsAttr(  'disabled', '', 'remove' );
                    botMoveObj.botMove(parentBoard, gameState);
                    gameState.setLoading(false);
                }, 1000 );

            // JUST CHANGE MARKS
            // FOR 2 PLAYERS GAME (without bot)
            } else gameState.changeTurn();
        }
    }
}



class BoardInDOM {
    constructor ( boardState ) {
        this.boardDOM = document.createElement('div');
        this.boardState = boardState;
        this.setNodeAttribute( 'id', 'gameBoard' );
    }
    setNodeAttribute ( attr, val ) {
        this.boardDOM.setAttribute( attr, val );
    }
    generateBoard (gameState) {
        let cellRow = null;
        let cell = null;
    
        for ( let row = 0; row < 3; row++ ) {
            
            cellRow = document.createElement('div');
    
            for ( let col = 0; col < 3; col++ ) {
                
                cell = new CellInDOM( row, col, this.boardState, gameState);
                cellRow.appendChild(cell.HTMLNode);
            }
            this.boardDOM.appendChild(cellRow);
        }
    }
    displayInDOM (gameState) {
        this.generateBoard(gameState);
        let gameBoardEl = document.getElementById('gameBoard');
        gameBoardEl.parentNode.replaceChild(this.boardDOM, gameBoardEl);
    }
}



class BotMoveBase {
    constructor ( DOMBoard, boardState, gameState) {
        this.moveScores = {
            [gameState.playersInfo[0].id]: -10,
            [gameState.playersInfo[1].id]: 10,
            tie: 0
        };
        this.newMove = { row: '', col:'' };
        this.hasNewMove = false;
        this.optionalWinner = null;
        this.optionalEmptyCells = 0;
        this.DOMBoard = DOMBoard;
        this.boardState = boardState;
        this.gameState = gameState
    }
    setNewMove ( r, c ) {
        this.newMove = { row: r, col: c }
    }
    setHasNewMove ( bool ) {
        this.hasNewMove = bool;
    }
    setOptionalWinner ( optWinner ) {
        this.optionalWinner = optWinner
    }
    setOptionalEmptyCells ( amount ) {
        this.optionalEmptyCells = amount
    }
    // LET'S MAKE THE BOT MOVES!
    botMove () {
        let bestMoveScore = -Infinity;
        this.setHasNewMove( false );
        let movesArray = []

        for ( let row = 0; row < 3; row++ ) {

            for ( let col = 0; col < 3; col++ ) {

                if ( !this.boardState.getCellValue(row, col) ) {
                    
                    this.boardState.setCell( row, col, this.gameState.playersInfo[1].mark );
                    this.gameState.setLatestPosition( row, col );
                    let moveScore = this.miniMax( false );
                    this.boardState.setCell( row, col, '' );

                    if ( moveScore == bestMoveScore ) {
                        movesArray.push( {row, col} );

                    } else if ( moveScore > bestMoveScore ) {
                        movesArray = []
                        movesArray.push( {row, col} );
                        bestMoveScore = moveScore;
                    }
                }
            }
        }
        console.log(movesArray)
        // add more randomness
        let randScore = movesArray[Math.floor(Math.random() * movesArray.length)];
        this.setNewMove( randScore.row, randScore.col );

        this.setHasNewMove( true );
        if ( this.hasNewMove ) {
            this.boardState.setCell( this.newMove.row, this.newMove.col, this.gameState.playersInfo[1].mark );
            document.querySelector( '[cell-row="' + this.newMove.row + '"][cell-col="' + this.newMove.col + '"]' ).click();
        }
    }
    // MINIMAX ALGORITHM
    miniMax ( isMaximizing ) {

        let result = this.checkOptionalWin();
        let bestMoveScore = -Infinity;

        if ( result !== null )
            return this.moveScores[result];
        
        if ( isMaximizing ) {

            for ( let row = 0; row < 3; row++ ) {

                for ( let col = 0; col < 3; col++ ) {

                    if ( !this.boardState.getCellValue(row, col) ) {

                        this.boardState.setCell( row, col, this.gameState.playersInfo[1].mark );
                        this.gameState.setLatestPosition( row, col);
                        let moveScore = this.miniMax( false );
                        this.boardState.setCell( row, col, '' );
                        bestMoveScore = Math.max( moveScore, bestMoveScore );
                    }
                }
            }

        } else {

            bestMoveScore = Infinity;

            for ( let row = 0; row < 3; row++ ) {

                for ( let col = 0; col < 3; col++ ) {
                    
                    if ( !this.boardState.getCellValue(row, col) ) {

                        this.boardState.setCell( row, col, this.gameState.playersInfo[0].mark );
                        this.gameState.setLatestPosition( row, col );
                        let moveScore = this.miniMax( true );
                        this.boardState.setCell( row, col, '' );
                        bestMoveScore = Math.min( moveScore, bestMoveScore );
                    }
                }
            }
        }
        return bestMoveScore;
    }
    // HELPER FOR MINIMAX ALGORITHM
    checkOptionalWin () {

        this.setOptionalWinner(null);
        this.setOptionalEmptyCells(0);

        if ( this.boardState.checkMarksInBoard( this.gameState.latestPosition ) ) {

            let optionalCellValue = this.boardState.getCellValue( this.gameState.latestPosition.row, this.gameState.latestPosition.col );                                                                       
            let newOptionalWinner = this.gameState.findMarkOwner(optionalCellValue);

            this.setOptionalWinner( newOptionalWinner );
        }

        // get empty cells
        for ( let row = 0; row < 3; row++ ) {

            for ( let col = 0; col < 3; col++ ) {
                
                if ( !this.boardState.getCellValue( row, col ) ) this.setOptionalEmptyCells(this.optionalEmptyCells + 1);
            }
        }
        
        return ( !this.optionalWinner && !this.optionalEmptyCells )
            ? 'tie'
            : this.optionalWinner;
    }
}



// CHANGING ALL CELLS

function changeCellsAttr ( attr, val = '', action = 'set' ) {

    Array.from( document.getElementsByClassName('cell') ).forEach( (cell) => {
        
        if ( action === 'remove' ) {
            if ( attr !== 'disabled' || ( !cell.value && attr === 'disabled' ) )
                cell.removeAttribute( attr );
            
        } else if ( attr === 'value' )
            cell[attr] = val;

        else if ( attr === 'disabled' )
            cell.setAttribute( attr, val );
    })
}



let ticTacToe = null;
let gameBoardState = null;
let gameBoardDOM = null;
let botMoveObj = null;


// RESET

function initGame () {

    if ( ticTacToe === null || !ticTacToe.loading ) {

        ticTacToe = new GameState();
        ticTacToe.setLoading(true);

        gameBoardState = new BoardState();
        gameBoardDOM = new BoardInDOM(gameBoardState);
        gameBoardDOM.displayInDOM(ticTacToe);

        botMoveObj = new BotMoveBase(gameBoardDOM, gameBoardState, ticTacToe);

        ticTacToe.changeCurrentGameMessage();
        ticTacToe.setLoading(false);
    }
}


document.addEventListener('DOMContentLoaded',  () => {

    initGame();
    document.getElementById('gameReset').addEventListener( 'click', () => initGame() );
})
