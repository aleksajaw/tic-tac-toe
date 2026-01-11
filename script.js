class GameState {
    constructor ( isSinglePlayer = true) {
        this.loading = false;
        this.playersInfo = [
            {
                id: 1,
                name: 'player 1',
                mark: 'X'
            },
            {   id: 2,
                name: isSinglePlayer ? 'computer' : 'player 2',
                mark: 'O',
                isBot: isSinglePlayer
            }
        ]
        this.whoseTurn = {  id: this.playersInfo[0].id,
                            mark: this.playersInfo[0].mark };
        this.latestPosition = { row: null, col: null };
        this.winner = null;
        this.isSinglePlayer = isSinglePlayer;
        this.currentGameMessage = ''
        this.gameInfoContainer = document.getElementById('gameInfo');
        this.switchModeButton = document.getElementById('switchGameMode');
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
    setTurn ( newTurn = { id: null, mark: null } ){
        this.setWhoseTurn( newTurn );
        this.changeCurrentGameMessage();
    }
    findPlayerByProp ( prop = 'id', value, equals = true ) {
        return this.playersInfo.find( el => equals ? el[prop] === value
                                                   : el[prop] !== value );
    }
    // WHOSE TURN
    changeTurn () {
        let player = this.findPlayerByProp( 'id', this.whoseTurn.id, false );
        let newTurn = { id: player.id, mark: player.mark };

        this.setTurn(newTurn);
    }
    updateGameInfoContainer ( text ) {
        text = text.replace(/\n/g, '<br>');
        this.gameInfoContainer.innerHTML = text;
    }
    changeCurrentGameMessage () {
        let futureMessage = ( this.winner !== null )
                              ? 'The winner is: ' + this.findPlayerByProp('id', this.winner).name + '.\n'
                              : '';

        futureMessage += ( this.whoseTurn.id !== null )
                              ? "We're waiting for: " + this.findPlayerByProp('id', this.whoseTurn.id).name
                              : 'Click "Reset\u00A0game" to\u00A0play\u00A0again.';
        
        this.setCurrentGameMessage( futureMessage );
        this.updateGameInfoContainer( this.currentGameMessage );
        console.log( this.currentGameMessage );
    }
    findMarkOwner ( mark ) {
        let owner = this.findPlayerByProp('mark', mark);
        return owner ? owner.id : null;
    }
    hasWinner ( board ) {
        let winnerMark = board.checkMarksInBoard( this.latestPosition);
        this.setWinner( this.findMarkOwner(winnerMark) );
        return this.winner !== null;
    }
    toggleGameMode ( mark = 'O' ) {
        this.isSinglePlayer = !this.isSinglePlayer;

        this.switchModeButton.innerText = this.isSinglePlayer ? 'Play with Friend'
                                                              : 'Make "' + mark + '" a Bot';
    }
    togglePlayer2FreeWill ( mark = 'O' ) {
        let player2 = this.findPlayerByProp('mark', mark);
        player2.isBot = !player2.isBot;
        player2.name = player2.isBot ? 'computer' : 'player 2';

        this.toggleGameMode(mark);
    }
    toggleDisabledSwitchModeButton ( ) {
        this.switchModeButton.disabled = !this.switchModeButton.disabled;
    }
    initSwitchModeButton ( botObj ) {
        if (!botObj instanceof BotMoveBase)
            return;
          
        this.switchModeButton.addEventListener( 'click', () => {
            this.togglePlayer2FreeWill();
            if ( this.isSinglePlayer )
              botObj.botMove();
        } );
    }
}



class Player {
    constructor ( id = null, mark = null, name = null, isBotModeActive = false ) {
        this.id = id;
        this.mark = mark;
        this.name = name;
        this.isBotModeActive = isBotModeActive;
        this.botModeDetails = { name: 'computer',
                                defaultName: name };
    }
    setName ( name = '') {
        this.name = name
    }
    isDefault () {
        return this.id === null
            && this.mark === null
            && this.name === null
    }
    isBot () {
        return this.isBotModeActive
    }
    toggleBotMode () {
        this.isBotModeActive = !this.isBotModeActive
        let newName = this.isBotModeActive ? this.botModeDetails.defaultName
                                           : this.name
        this.setName( newName );
    }
    isPropertyEqualTo ( name = 'id', value = null) {
        return this[name] === value
    }
    isPropertyNotEqualTo ( name = 'id', value = null) {
        return this[name] !== value
    }
    matchesId ( anotherPlayer ) {
        if (anotherPlayer instanceof Player)
            return null;
        
        return this.id === anotherPlayer.id;
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
    resetCellValue ( { row, col } ) {
        this.setCellValue( { row, col }, '' );
    }
    getCellValue ( { row, col } ) {
        return this.matrixState[row][col]
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount
    }
    reduceEmptyCells () {
        this.setEmptyCells( this.emptyCells - 1 );
    }
    checkMarksInLine ( cellCoords = [ ['','',''], ['','',''], ['','',''] ]) {
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
    applyMarkToCell ( { row, col } ) {
        this.setValue( this.gameState.whoseTurn.mark );
        this.setDisabled(true);
        this.parentBoardState.setCellValue( { row, col }, this.gameState.whoseTurn.mark );
        this.parentBoardState.reduceEmptyCells();
        this.gameState.setLatestPosition( { row, col } );
    }
    updateOnClick( { row, col } ) {
        this.gameState.toggleDisabledSwitchModeButton();
        this.applyMarkToCell( { row, col } );

        // HAS WINNER OR TIE
        if ( ( this.gameState.hasWinner(this.parentBoardState)
           || !this.parentBoardState.emptyCells ) ){

                this.parentBoardDOM.toggleCellsDisabled(true);
                this.gameState.setTurn();
                this.gameState.toggleDisabledSwitchModeButton();

        } else {
            // BOT MOVE
            if ( this.gameState.whoseTurn.mark !== this.gameState.playersInfo[1].mark
              && this.gameState.playersInfo[1].isBot ) {
                
                this.parentBoardDOM.toggleCellsDisabled(true);
                this.gameState.changeTurn();
                this.gameState.setLoading(true);

                setTimeout( () => {
                    this.parentBoardDOM.toggleCellsDisabled();
                    botMoveObj.botMove(this.parentBoardDOM, this.gameState);
                    this.gameState.setLoading(false);
                    this.gameState.toggleDisabledSwitchModeButton();
                }, 1000 );

            // JUST CHANGE MARKS
            // FOR 2 PLAYERS GAME (without bot)
            } else {
              this.gameState.changeTurn();
              this.gameState.toggleDisabledSwitchModeButton();
            }
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
    updateTempCellState ( { row, col }, playerId = 1 ) {
        this.boardState.setCellValue( { row, col }, this.gameState.playersInfo[playerId].mark );
        this.gameState.setLatestPosition( { row, col } );
    }
    // LET'S MAKE THE BOT MOVES!
    botMove () {
        if ( this.gameState.findPlayerByProp('isBot', true).id === this.gameState.whoseTurn.id ) {
            let bestMoveScore = -Infinity;
            let movesArray = []

            for ( let row = 0; row < 3; row++ ) {
                for ( let col = 0; col < 3; col++ ) {

                    if ( !this.boardState.getCellValue( { row, col } ) ) {
                        
                        this.updateTempCellState( { row, col } );

                        let moveScore = this.miniMax( false );

                        this.boardState.resetCellValue( { row, col } );

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
          let randomness = Math.floor( Math.random() * movesArray.length );
          let randomPossibleMove = movesArray[ randomness ];

          this.boardState.setCellValue( randomPossibleMove, this.gameState.playersInfo[1].mark );
          this.boardDOM.clickSpecificCell( randomPossibleMove );
        }
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

                        this.updateTempCellState( { row, col } );

                        let moveScore = this.miniMax( false );

                        this.boardState.resetCellValue( { row, col } );

                        bestMoveScore = Math.max( moveScore, bestMoveScore );
                    }
                }
            }

        } else {

            bestMoveScore = Infinity;

            for ( let row = 0; row < 3; row++ ) {
                for ( let col = 0; col < 3; col++ ) {
                    
                    if ( !this.boardState.getCellValue( { row, col } ) ) {

                        this.updateTempCellState( { row, col }, 0 );

                        let moveScore = this.miniMax( true );

                        this.boardState.resetCellValue( { row, col } );

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
                
                if ( !this.boardState.getCellValue( { row, col } ) )
                    optionalEmptyCells += 1;
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

        ticTacToe = (ticTacToe === null) ? new GameState()
                                         : new GameState( ticTacToe.isSinglePlayer );
        
        ticTacToe.setLoading(true);

        gameBoardState = new BoardState();
        gameBoardDOM = new BoardInDOM(gameBoardState, ticTacToe);

        botMoveObj = new BotMoveBase(gameBoardDOM, gameBoardState, ticTacToe);

        ticTacToe.initSwitchModeButton(botMoveObj);

        ticTacToe.changeCurrentGameMessage();
        ticTacToe.setLoading(false);
    }
}


document.addEventListener('DOMContentLoaded',  () => {

    initGame();
    document.getElementById('gameReset').addEventListener( 'click', () => initGame() );
})