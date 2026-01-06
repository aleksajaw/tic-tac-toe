class GameState {
    constructor () {
        this.loading = false;
        this.playersInfo = [
            {
                id: 1,
                name: 'player 1',
                mark: 'X'
            },
            {
                id: 2,
                name: 'computer',
                mark: 'O',
                isBot: true
            }
        ]
        this.whoseTurn = this.playersInfo[0].id;
        this.currentMark = this.playersInfo[0].mark;
        this.currentPosition = { row: null, col: null };
        this.hasWinner = false;
        this.endGameMessage = '';
    }
    setLoading ( bool ) {
        this.loading = bool
    }
    setWhoseTurn ( id ) {
        this.whoseTurn = id;
    }
    setCurrentMark ( mark ) {
        this.currentMark = mark;
    }
    setCurrentGameMessage ( text ) {
        this.currentGameMessage = text
    }
    setHasWinner ( bool ) {
        this.hasWinner = bool
    }
    setEndGameMessage ( text ) {
        this.endGameMessage = text;
    }
    setCurrentPosition ( row, col ) {
        this.currentPosition = { row, col };
    }
    // WHOSE TURN
    changeTurn () {
        let newTurn = '';
        let newMark = '';

        if ( this.whoseTurn === this.playersInfo[0].id ) {
            newTurn = this.playersInfo[1].id;
            newMark = this.playersInfo[1].mark;

        } else if ( this.whoseTurn === this.playersInfo[1].id ) {
            newTurn = this.playersInfo[0].id;
            newMark = this.playersInfo[0].mark;
        }
        this.setWhoseTurn( newTurn );
        this.setCurrentMark( newMark );
        this.changeCurrentGameMessage();
    }
    changeCurrentGameMessage () {
        if ( this.whoseTurn !== null ) {
            this.setCurrentGameMessage( "We're waiting for: " + this.playersInfo.find(el => el.id === this.whoseTurn).name );
        } else {
            this.setCurrentGameMessage( 'Click "Reset\u00A0game" button to\u00A0play\u00A0again.' );
        }
        console.log( this.currentGameMessage );
        document.getElementById('gameInfo').innerHTML = this.currentGameMessage;
    }
    // DID ANYBODY WIN?
    // shorter function for user move
    // (less calculations)
    updateHasWinner ( board ) {
        this.setHasWinner(false);
        let row = this.currentPosition.row;
        let col = this.currentPosition.col;

        // row & column
        if ( board.checkMarksInLine( board.getCellValue(row, 0), board.getCellValue(row, 1), board.getCellValue(row, 2) )
          || board.checkMarksInLine( board.getCellValue(0, col), board.getCellValue(1, col), board.getCellValue(2, col) ) ) {
                
            this.setHasWinner(true);
        }
        // diagonals
        else if ( ( board.diagonalLeftCoordinates.includes( row + '' + col ) && board.checkInDiagonal('left') )
                | ( board.diagonalRightCoordinates.includes( row + '' + col ) && board.checkInDiagonal('right') ) ) {
                    
                    this.setHasWinner(true);
        }

        return this.hasWinner;
    }
}



class BoardState {
    constructor ( matrixState = [ [ '', '', '' ], [ '', '', '' ], [ '', '', '' ] ] ) {
        this.matrixState = matrixState;
        this.emptyCells = 9;
        this.diagonalLeftCoordinates = ['00', '11', '22'];
        this.diagonalRightCoordinates = ['02', '11', '20'];
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
    checkMarksInLine ( cell1, cell2, cell3 ) {
        return ( cell1 === cell2
              && cell2 === cell3
              && cell3 != null )
    }
    checkInDiagonal ( dir ){
        if ( dir === 'left' )
            return this.checkMarksInLine( this.getCellValue(0, 0), this.getCellValue(1,1), this.getCellValue(2,2) )

        else if ( dir === 'right' )
            return this.checkMarksInLine( this.getCellValue(2, 0), this.getCellValue(1,1), this.getCellValue(0,2) )

        else
            return false
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
        this.setNodeValue( gameState.currentMark );
        this.setNodeDisabled( true );
        parentBoard.setCell( row, col, gameState.currentMark );
        parentBoard.setEmptyCells( parentBoard.emptyCells - 1 );
        gameState.setCurrentPosition( row, col );
        let noNextTurn = false;

        //   9 fields  -  2 players  *  2 moves  =  5 empty cells
        if ( parentBoard.emptyCells < 5 ) {

            // ONE WINNER
            if ( gameState.updateHasWinner(parentBoard) ) {
                noNextTurn = true
                gameState.setEndGameMessage('PLAYER WITH MARK "' + gameState.currentMark + '" WIN!');

            // TIE
            } else if ( !parentBoard.emptyCells ) {
                noNextTurn = true
                gameState.setEndGameMessage('BOTH PLAYERS WIN :)');
            }

            if ( noNextTurn ) {
                changeCellsAttr('disabled', '');
                gameState.setWhoseTurn(null);
                gameState.changeCurrentGameMessage();
                setTimeout( () => { alert(gameState.endGameMessage) }, 100 );
            }
        }

        if ( !noNextTurn ) {
            // BOT MOVE
            if ( gameState.currentMark != gameState.playersInfo[1].mark && gameState.playersInfo[1].isBot ) {
                
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
                    this.gameState.setCurrentPosition( row, col );
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
                        this.gameState.setCurrentPosition( row, col);
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
                        this.gameState.setCurrentPosition( row, col );
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

        if ( this.gameState.updateHasWinner( this.boardState ) ) {
            let newOptWinner = ( this.boardState.getCellValue( this.gameState.currentPosition.row, this.gameState.currentPosition.col ) === this.gameState.playersInfo[0].mark )
                ? this.gameState.playersInfo[0].id
                : this.gameState.playersInfo[1].id;
            this.setOptionalWinner( newOptWinner );
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
