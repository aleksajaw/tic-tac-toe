
// SETUP

function giveMeCells () {

    let row = null;
    let cell = null;
    let cellIndex = 0;
    let TTTboard = document.getElementById('TTTboard');
    let TTTnewBoard = document.createElement('div');
    TTTnewBoard.setAttribute( "id", "TTTboard" );

    for ( let r = 0; r < 3; r++ ) {
        
        row = document.createElement('div');

        for ( let c = 0; c < 3; c++ ) {
            
            cell = document.createElement('input');
            cell.type = 'text';
            cell.classList.add('cell');
            cell.setAttribute( 'cell-index', cellIndex );
            cell.setAttribute( 'cell-row', r );
            cell.setAttribute( 'cell-col', c );
            cell.readOnly = true;
            row.appendChild(cell)
            cellIndex++;
        }
        TTTnewBoard.appendChild(row);
    }
    TTTboard.parentNode.replaceChild(TTTnewBoard, TTTboard);
}


function addEventsToCells () {

    let cells = document.getElementsByClassName('cell');
    for ( let i = 0; i < cells.length; i++ ) {
        let cell = cells[i];
        cell.addEventListener('click', () => {
            clickedCell( cell.getAttribute('cell-index'), cell.getAttribute('cell-row'), cell.getAttribute('cell-col'))
        } );
    }
}


//------------------------------------------------------MAIN PART------------------------------------------------------//


// DECLARATION BASICS

let userMark = 'X';
let opponentMark = 'O';
let whoStarts = 'user';
let turn = 'user';
let currentMark = 'X';
let turnField = null;
// change below if you want to just play with a friend
let isOpponentBot = true;
let mainBoard = [
    [ '', '', '' ],
    [ '', '', '' ],
    [ '', '', '' ]
];
let currRow = null;
let currCol = null;
let emptyCells = 9;
let loading = false;


// FIRST ACTION

function clickedCell( index, row, col ) {

    let cell = document.getElementsByClassName('cell')[index];
    cell.value = currentMark;
    cell.disabled = true;
    mainBoard[row][col] = currentMark;
    emptyCells--;
    currRow = row;
    currCol = col;
    let noNextTurn = false;
    let message = '';

    if ( emptyCells < 5 ) {

        // ONE WINNER
        if ( checkIsWin() ) {
            noNextTurn = true
            message = 'PLAYER WITH MARK "' + currentMark + '" WIN!';
            changeTurnField('reset game');

        // TIE
        } else if ( !emptyCells ) {
            noNextTurn = true
            message = 'BOTH PLAYERS WIN :)';
        }

        if ( noNextTurn ) {
            changeCellsAttr('disabled', '');
            setTimeout( () => { alert(message) }, 100 );
        }
    }

    if ( !noNextTurn) {
        // BOT MOVE
        if ( currentMark != opponentMark && isOpponentBot ) {
            
            changeCellsAttr( 'disabled', '' );
            changeTurn();
            loading = true;
            setTimeout( () => {
                changeCellsAttr(  'disabled', '', 'remove' );
                botMove();
                loading = false;
            }, 1000 );

        // JUST CHANGE MARKS
        // FOR 2 PLAYERS GAME (without bot)
        } else changeTurn();
    }
}


// WHOSE TURN

function changeTurn () {
    
    if ( turn === 'user' ) {
        turn = 'opponent';
        currentMark = opponentMark;

    } else if ( turn === 'opponent' ) {
        turn = 'user';
        currentMark = userMark;
    }
    changeTurnField(turn);
}


function changeTurnField ( text ) {

    if ( !turnField ) turnField = document.getElementById('turnField');
    turnField.innerHTML = text;
}


// MARKS IN LINE

function checkMarksInLine ( cell1, cell2, cell3 ) {
    
    return ( cell1 === cell2 && cell2 === cell3 && cell3 != null )
}


// DID ANYBODY WIN?
// shorter function for user move
// (less calculations)

function checkIsWin ( board ) {
    
    if ( !board ) board = mainBoard;
    let diagonalLeft = ['00', '11', '22'];
    let diagonalRight = ['02', '11', '20'];
    let win = false;
    let row = currRow;
    let col = currCol;

    // row & column
    if ( checkMarksInLine( board[row][0], board[row][1], board[row][2] )
        || checkMarksInLine( board[0][col], board[1][col], board[2][col] ) ) {
        
        win = true;
    }

    // diagonals
    else if ( ( diagonalLeft.includes( row + '' + col ) && checkInDiagonal('left') )
            || ( diagonalRight.includes( row + '' + col ) && checkInDiagonal('right') ) ) {
            
            win = true;
    }

    return win;
}


// DIAGONALS CHECKING BASE

function checkInDiagonal ( dir, board ){

    if ( !board ) board = mainBoard;

    return ( dir === 'left' )
                ? checkMarksInLine( board[0][0], board[1][1], board[2][2] )
         : ( dir === 'right' )
                ? checkMarksInLine( board[2][0], board[1][1], board[0][2] )
                : false

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


let moveScores = {
    user: -10,
    computer: 10,
    tie: 0
};


// LET'S MAKE THE BOT MOVES!

function botMove ( board ) {

    if ( !board ) board = mainBoard ;
    let bestMoveScore = -Infinity;
    let newMove = null;

    for ( let r = 0; r < 3; r++ ) {

        for ( let c = 0; c < 3; c++ ) {

            if ( !board[r][c] ) {
                
                board[r][c] = opponentMark;
                currRow = r;
                currCol = c;
                let moveScore = miniMax( board, 0, false );
                board[r][c] = '';

                if ( moveScore > bestMoveScore ) {
                    bestMoveScore = moveScore;
                    newMove = { r, c };
                }
            }
        }
    }
    if ( newMove ) {
        board[newMove.r][newMove.c] = opponentMark;
        document.querySelectorAll( '[cell-row="' + newMove.r + '"][cell-col="' + newMove.c + '"]' )[0].click();
    }
}


// MINIMAX ALGORITHM

function miniMax ( board, isMaximizing ) {

    if ( !board ) board = mainBoard;
    let result = checkOptionalWin(board);
    let bestMoveScore = -Infinity;

    if ( result !== null )
        return moveScores[result];
      
    if ( isMaximizing ) {

        for ( let r = 0; r < 3; r++ ) {

            for ( let c = 0; c < 3; c++ ) {

                if ( !board[r][c] ) {

                    board[r][c] = opponentMark;
                    currRow = r;
                    currCol = c;
                    let moveScore = miniMax( board, false );
                    board[r][c] = '';
                    bestMoveScore = Math.max( moveScore, bestMoveScore );
                }
            }
        }

    } else {

        bestMoveScore *= -1;

        for ( let r = 0; r < 3; r++ ) {

            for ( let c = 0; c < 3; c++ ) {
                
                if ( !board[r][c] ) {

                    board[r][c] = userMark;
                    currRow = r;
                    currCol = c;
                    let moveScore = miniMax( board, true );
                    board[r][c] = '';
                    bestMoveScore = Math.min( moveScore, bestMoveScore );
                }
            }
        }
    }
    
    return bestMoveScore;
}


// HELPER FOR MINIMAX ALGORITHM

function checkOptionalWin ( board ) {

    let optionalWinner = null;
    let optionalEmptyCells = 0;

    if ( checkIsWin() )
        optionalWinner = ( board[currRow][currCol] === userMark )
            ? 'user'
            : 'computer';

    // get empty cells
    for ( let r = 0; r < 3; r++ ) {

        for ( let c = 0; c < 3; c++ ) {
            
            if ( !board[r][c] ) optionalEmptyCells++;
        }
    }
    
    return ( !optionalWinner && !optionalEmptyCells )
        ? 'tie'
        : optionalWinner;
}


// RESET

function resetGame () {

    if ( !loading ) {
        loading = true;
        userMark = 'X';
        opponentMark = 'O';
        whoStarts = 'user';
        turn = 'user';
        currentMark = 'X';
        turnField.innerHTML = turn;
        isOpponentBot = true;
        mainBoard = [
            [ '', '', '' ],
            [ '', '', '' ],
            [ '', '', '' ]
        ];
        currRow = null;
        currCol = null;
        emptyCells = 9;
        changeCellsAttr( 'value', '' );
        changeCellsAttr( 'disabled', '', 'remove' );
        loading = false;
    }
}


document.addEventListener('DOMContentLoaded',  () => {

    giveMeCells();
    addEventsToCells();
    document.getElementById('reset').addEventListener( 'click', () => resetGame() );
    changeTurnField(turn);
})