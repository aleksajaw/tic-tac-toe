class GameState {
    constructor () {
        this.loading = false;
        this.player1Mark = 'X';
        this.opponentMark = 'O';
        this.isOpponentBot = true;
        this.player1Name = 'player1';
        this.opponentName = 'computer';
        this.whoseTurn = 'player1';
        this.currentMark = 'X';
        this.currentGameMessage = ''
        this.currentRow = null;
        this.currentCol = null;
        this.hasWinner = false;
        this.endGameMessage = '';
    }
    setLoading ( bool ) {
        this.loading = bool
    }
    setIsOpponentBot ( bool ) {
        this.isOpponentBot = bool
    }
    setOpponentName ( text ) {
        this.opponentName = text;
    }
    setWhoseTurn ( player ) {
        this.whoseTurn = player;
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
    updateCurrentPosition ( row, col ) {
        this.currentRow = row;
        this.currentCol = col;
    }
    // WHOSE TURN
    changeTurn () {
        let newTurn = '';
        let newMark = '';

        if ( this.whoseTurn === this.player1Name ) {
            newTurn = this.opponentName;
            newMark = this.opponentMark;

        } else if ( this.whoseTurn === this.opponentName ) {
            newTurn = this.player1Name;
            newMark = this.player1Mark;
        }
        this.setWhoseTurn( newTurn );
        this.setCurrentMark( newMark );
        this.changeCurrentGameMessage();
    }
    changeCurrentGameMessage () {
        if ( this.whoseTurn != '' ) {
            this.setCurrentGameMessage( "We're waiting for: " + this.whoseTurn );
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
        let row = this.currentRow;
        let col = this.currentCol;

        // row & column
        if ( board.checkMarksInLine( board.getCell(row, 0), board.getCell(row, 1), board.getCell(row, 2) )
          || board.checkMarksInLine( board.getCell(0, col), board.getCell(1, col), board.getCell(2, col) ) ) {
                
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



let ticTacToe = new GameState();



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
    getCell ( row, col ) {
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
            return this.checkMarksInLine( this.getCell(0, 0), this.getCell(1,1), this.getCell(2,2) )

        else if ( dir === 'right' )
            return this.checkMarksInLine( this.getCell(2, 0), this.getCell(1,1), this.getCell(0,2) )

        else
            return false
    }
    writeMatrixStateInConsole ( ) {
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



let mainBoard = new BoardState();



class CellInDOM {
    constructor ( row, col ) {
        this.HTMLNode = document.createElement('input');
        this.setNodeType( 'text' );
        this.addNodeClass( 'cell' );
        this.setNodeAttribute( 'cell-row', row );
        this.setNodeAttribute( 'cell-col', col );
        this.setNodeReadOnly( true );
        this.addNodeEvent( 'click', () => {
            this.clickedCell( this.getNodeAttribute('cell-row'), this.getNodeAttribute('cell-col') )
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
    clickedCell( row, col ) {
        this.setNodeValue( ticTacToe.currentMark );
        this.setNodeDisabled( true );
        mainBoard.setCell( row, col, ticTacToe.currentMark );
        mainBoard.setEmptyCells( mainBoard.emptyCells - 1 );
        ticTacToe.updateCurrentPosition( row, col );
        let noNextTurn = false;

        if ( mainBoard.emptyCells < 5 ) {

            // ONE WINNER
            if ( ticTacToe.updateHasWinner(mainBoard) ) {
                noNextTurn = true
                ticTacToe.setEndGameMessage('PLAYER WITH MARK "' + ticTacToe.currentMark + '" WIN!');

            // TIE
            } else if ( !mainBoard.emptyCells ) {
                noNextTurn = true
                ticTacToe.setEndGameMessage('BOTH PLAYERS WIN :)');
            }

            if ( noNextTurn ) {
                changeCellsAttr('disabled', '');
                /*ticTacToe.setCurrentPlayerName(' - ');*/
                ticTacToe.setWhoseTurn('');
                ticTacToe.changeCurrentGameMessage();
                setTimeout( () => { alert(ticTacToe.endGameMessage) }, 100 );
            }
        }

        if ( !noNextTurn ) {
            // BOT MOVE
            if ( ticTacToe.currentMark != ticTacToe.opponentMark && ticTacToe.isOpponentBot ) {
                
                changeCellsAttr( 'disabled', '' );
                ticTacToe.changeTurn();
                ticTacToe.setLoading(true);
                setTimeout( () => {
                    changeCellsAttr(  'disabled', '', 'remove' );
                    botMove();
                    ticTacToe.setLoading(false);
                }, 1000 );

            // JUST CHANGE MARKS
            // FOR 2 PLAYERS GAME (without bot)
            } else ticTacToe.changeTurn();
        }
    }
}



class BoardInDOM {
    constructor () {
        this.boardDOM = document.createElement('div');
        this.setNodeAttribute( "id", "gameBoard" );
    }
    setNodeAttribute ( attr, val ) {
        this.boardDOM.setAttribute( attr, val );
    }
    giveMeCells () {
        let row = null;
        let cell = null;
    
        for ( let r = 0; r < 3; r++ ) {
            
            row = document.createElement('div');
    
            for ( let c = 0; c < 3; c++ ) {
                
                cell = new CellInDOM( r, c );
                row.appendChild(cell.HTMLNode);
            }
            this.boardDOM.appendChild(row);
        }
    }
    displayInDOM () {
        this.giveMeCells();
        let gameBoard = document.getElementById('gameBoard');
        gameBoard.parentNode.replaceChild(this.boardDOM, gameBoard);
    }
}



let gameBoard = new BoardInDOM();



class BotMoveBase {
    constructor () {
        this.moveScores = {
            player1: -10,
            computer: 10,
            tie: 0
        };
        this.newMove = { row: '', col:'' };
        this.hasNewMove = false;
        this.optionalWinner = null;
        this.optionalEmptyCells = 0;
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
}



let botMoveObj = new BotMoveBase();



// LET'S MAKE THE BOT MOVES!

function botMove ( board ) {

    if ( !board ) board = mainBoard;
    let bestMoveScore = -Infinity;
    botMoveObj.setHasNewMove( false );
    let movesArray = []

    for ( let r = 0; r < 3; r++ ) {

        for ( let c = 0; c < 3; c++ ) {

            if ( !board.getCell(r,c) ) {
                
                board.setCell( r, c, ticTacToe.opponentMark );
                ticTacToe.updateCurrentPosition( r, c );
                let moveScore = miniMax( board, false );
                board.setCell( r, c, '' );

                if ( moveScore == bestMoveScore ) {
                    movesArray.push({r,c});

                } else if ( moveScore > bestMoveScore ) {
                    movesArray = []
                    movesArray.push({r,c});
                    bestMoveScore = moveScore;
                }
            }
        }
    }
    console.log(movesArray)
    // add more randomness
    randScore = movesArray[Math.floor(Math.random() * movesArray.length)];
    botMoveObj.setNewMove( randScore.r, randScore.c );

    botMoveObj.setHasNewMove( true );
    if ( botMoveObj.hasNewMove ) {
        board.setCell( botMoveObj.newMove.row, botMoveObj.newMove.col, ticTacToe.opponentMark);
        document.querySelectorAll( '[cell-row="' + botMoveObj.newMove.row + '"][cell-col="' + botMoveObj.newMove.col + '"]' )[0].click();
    }
}


// MINIMAX ALGORITHM

function miniMax ( board, isMaximizing ) {

    if ( !board ) board = mainBoard;
    let result = checkOptionalWin(board);
    let bestMoveScore = -Infinity;

    if ( result !== null )
        return botMoveObj.moveScores[result];
    
    if ( isMaximizing ) {

        for ( let r = 0; r < 3; r++ ) {

            for ( let c = 0; c < 3; c++ ) {

                if ( !board.getCell(r,c) ) {


                    board.setCell( r, c, ticTacToe.opponentMark );
                    ticTacToe.updateCurrentPosition( r, c );
                    let moveScore = miniMax( board, false );
                    board.setCell( r, c, '' );
                    bestMoveScore = Math.max( moveScore, bestMoveScore );
                }
            }
        }

    } else {

        bestMoveScore = Infinity;

        for ( let r = 0; r < 3; r++ ) {

            for ( let c = 0; c < 3; c++ ) {
                
                if ( !board.getCell(r,c) ) {

                    board.setCell( r, c, ticTacToe.player1Mark );
                    ticTacToe.updateCurrentPosition( r, c );
                    let moveScore = miniMax( board, true );
                    board.setCell( r, c, '' );
                    bestMoveScore = Math.min( moveScore, bestMoveScore );
                }
            }
        }
    }
    return bestMoveScore;
}


// HELPER FOR MINIMAX ALGORITHM

function checkOptionalWin ( board ) {

    botMoveObj.setOptionalWinner(null);
    botMoveObj.setOptionalEmptyCells(0);

    if ( ticTacToe.updateHasWinner(board) ) {
        let newOptWinner = ( board.getCell(ticTacToe.currentRow, ticTacToe.currentCol) === ticTacToe.player1Mark )
            ? 'player1'
            : 'computer';
        botMoveObj.setOptionalWinner( newOptWinner );
    }

    // get empty cells
    for ( let r = 0; r < 3; r++ ) {

        for ( let c = 0; c < 3; c++ ) {
            
            if ( !board.getCell(r,c) ) botMoveObj.setOptionalEmptyCells(botMoveObj.optionalEmptyCells + 1);
        }
    }
    
    return ( !botMoveObj.optionalWinner && !botMoveObj.optionalEmptyCells )
        ? 'tie'
        : botMoveObj.optionalWinner;
}


// CHANGING ALL CELLS

function changeCellsAttr ( attr, val = '', action = 'set' ) {

    Array.from( document.getElementsByClassName('cell') ).forEach( (cell) => {
        
        if ( action === 'remove' ) {
            if ( attr != 'disabled' || ( !cell.value && attr === 'disabled' ) )
                cell.removeAttribute( attr );
            
        } else if ( attr === 'value' )
            cell[attr] = val;

        else if ( attr === 'disabled' )
            cell.setAttribute( attr, val );
    })
}


// RESET

function resetGame () {

    if ( !ticTacToe.loading ) {
        ticTacToe = new GameState();
        ticTacToe.setLoading(true);
        /*ticTacToe.setCurrentPlayerName(ticTacToe.whoseTurn);*/
        ticTacToe.changeCurrentGameMessage();
        mainBoard = new BoardState();
        gameBoard = new BoardInDOM();
        gameBoard.displayInDOM();
        ticTacToe.setLoading(false);
    }
}


document.addEventListener('DOMContentLoaded',  () => {

    gameBoard = new BoardInDOM();
    gameBoard.displayInDOM();
    ticTacToe = new GameState();
    mainBoard = new BoardState();
    document.getElementById('gameReset').addEventListener( 'click', () => resetGame() );
    /*ticTacToe.setCurrentPlayerName(ticTacToe.whoseTurn);*/
    ticTacToe.changeCurrentGameMessage();
})
