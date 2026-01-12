class GameState {
    constructor ( isSinglePlayer = true) {
        this.loading = false;
        this.players = [
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
        this.currentPlayer = {  id: this.players[0].id,
                              mark: this.players[0].mark };
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
    setCurrentPlayer ( info = { id: null, mark: null } ) {
        this.currentPlayer = info;
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
    changeCurrentPlayer ( nextPlayer = { id: null, mark: null } ){
        this.setCurrentPlayer( nextPlayer );
        this.changeCurrentGameMessage();
    }
    findPlayerByProperty ( prop = 'id', value, equals = true ) {
        return this.players.find( el => equals ? el[prop] === value
                                               : el[prop] !== value );
    }
    // WHOSE TURN
    switchCurrentPlayer () {
        let player = this.findPlayerByProperty( 'id', this.currentPlayer.id, false );
        let nextPlayer = { id: player.id, mark: player.mark };

        this.changeCurrentPlayer(nextPlayer);
    }
    updateGameInfoContainer ( text ) {
        text = text.replace(/\n/g, '<br>');
        this.gameInfoContainer.innerHTML = text;
    }
    updateSwitchButtonText (text) {
        this.switchModeButton.innerHTML = text
    }
    changeCurrentGameMessage () {
        let futureMessage = ( this.winner !== null )
                              ? 'The winner is: ' + this.findPlayerByProperty('id', this.winner).name + '.\n'
                              : '';

        futureMessage += ( this.currentPlayer.id !== null )
                              ? "We're waiting for: " + this.findPlayerByProperty('id', this.currentPlayer.id).name
                              : 'Click "Reset\u00A0game" to\u00A0play\u00A0again.';
        
        this.setCurrentGameMessage( futureMessage );
        this.updateGameInfoContainer( this.currentGameMessage );
        console.log( this.currentGameMessage );
    }
    findMarkOwner ( mark ) {
        let owner = this.findPlayerByProperty('mark', mark);
        return owner ? owner.id : null;
    }
    hasWinner ( board ) {
        let winnerMark = board.findWinningMarkInBoard( this.latestPosition);
        this.setWinner( this.findMarkOwner(winnerMark) );
        return this.winner !== null;
    }
    toggleGameMode ( mark = 'O' ) {
        this.isSinglePlayer = !this.isSinglePlayer;

        let text = this.isSinglePlayer ? 'Play with Friend'
                                       : 'Make "' + mark + '" a Bot';
        this.updateSwitchButtonText( text );
    }
    togglePlayer2FreeWill ( mark = 'O' ) {
        let player2 = this.findPlayerByProperty('mark', mark);
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
        if (!anotherPlayer instanceof Player)
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
    isCellEmpty ( { row, col } ) {
        return !this.getCellValue( { row, col } );
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount
    }
    reduceEmptyCells () {
        this.setEmptyCells( this.emptyCells - 1 );
    }
    hasEmptyCells () {
        return this.emptyCells > 0
    }
    hasEnoughFilledCells () {
        return this.emptyCells < 5
    }
    findWinningMarkInLine ( cellCoords = [] ) {
        let cellValue1 = this.getCellValue( { row: cellCoords[0][0], col: cellCoords[0][1] } );
        let cellValue2 = this.getCellValue( { row: cellCoords[1][0], col: cellCoords[1][1] } );
        let cellValue3 = this.getCellValue( { row: cellCoords[2][0], col: cellCoords[2][1] } );

        return ( cellValue1 != null
              && cellValue1 === cellValue2
              && cellValue2 === cellValue3 ) ? cellValue1
                                             : null
    }
    findWinningMarkInCross ( { row, col } ) {
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
    findWinningMarkInBoard ( latestPosition ) {
        return this.findWinningMarkInCross( latestPosition )
            || this.findWinningMarkInDiagonalCross();
    }
}



class CellInDOM {
    constructor ( { row, col }, parentBoardDOM, parentBoardState, stateGame ) {
        this.parentBoardDOM = parentBoardDOM;
        this.parentBoardState = parentBoardState;
        this.stateGame = stateGame;

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
    getDataSet () {
        return this.HTMLNode.dataset
    }
    setDatasetAndAria ( { row, col } ) {
        Object.assign( this.HTMLNode.dataset, { row: row, col: col } );
        this.HTMLNode.ariaLabel = `Cell in row ${row + 1}, column ${col + 1}`;
    }
    applyMarkToCell ( { row, col } ) {
        this.setValue( this.stateGame.currentPlayer.mark );
        this.setDisabled(true);
        this.parentBoardState.setCellValue( { row, col }, this.stateGame.currentPlayer.mark );
        this.parentBoardState.reduceEmptyCells();
        this.stateGame.setLatestPosition( { row, col } );
    }
    updateOnClick( { row, col } ) {
        this.stateGame.toggleDisabledSwitchModeButton();
        this.applyMarkToCell( { row, col } );

        // HAS WINNER OR TIE
        if ( ( this.stateGame.hasWinner(this.parentBoardState)
           || !this.parentBoardState.hasEmptyCells() ) ){

                this.parentBoardDOM.toggleCellsDisabled(true);
                this.stateGame.changeCurrentPlayer();
                this.stateGame.toggleDisabledSwitchModeButton();

        } else {
            // BOT MOVE
            if ( this.stateGame.currentPlayer.mark !== this.stateGame.players[1].mark
              && this.stateGame.players[1].isBot ) {
                
                this.parentBoardDOM.toggleCellsDisabled(true);
                this.stateGame.switchCurrentPlayer();
                this.stateGame.setLoading(true);

                setTimeout( () => {
                    this.parentBoardDOM.toggleCellsDisabled();
                    botMoveObj.botMove(this.parentBoardDOM, this.stateGame);
                    this.stateGame.setLoading(false);
                    this.stateGame.toggleDisabledSwitchModeButton();
                }, 1000 );

            // JUST CHANGE MARKS
            // FOR 2 PLAYERS GAME (without bot)
            } else {
              this.stateGame.switchCurrentPlayer();
              this.stateGame.toggleDisabledSwitchModeButton();
            }
        }
    }
}



class BoardInDOM {
    constructor ( stateBoard, stateGame ) {
        this.boardDOM = document.getElementById('gameBoard');
        this.stateBoard = stateBoard;
        this.stateGame = stateGame;
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
    createCellWithDOM ( cell, { row, col } ) {
        cell = new CellInDOM( { row, col }, this, this.stateBoard, this.stateGame );
        this.addCell( cell );
        this.boardDOM.appendChild( cell.HTMLNode )
    }
    generateBoard () {
        this.resetBoardDOM();
        let cell = null;
    
        for ( let row = 0; row < 3; row++ )
            for ( let col = 0; col < 3; col++ )

                this.createCellWithDOM( cell, { row, col } );
    }
    toggleCellsDisabled ( force = false ) {
        this.cells.forEach( (cell) => {

            let disabledState = (cell.getValue() !== '' || force );
            cell.setDisabled( disabledState );
        } );
    }
    clickSpecificCell ( { row, col } ) {
        let targetCell = this.cells.find( cell => ( parseInt(cell.getDataSet().row) === row
                                                 && parseInt(cell.getDataSet().col) === col ) );
        if ( targetCell )
            targetCell.HTMLNode.click();
    }
}



class BotMoveBase {
    constructor ( boardDOM, stateBoard, stateGame ) {
        this.botMoveScores = {
            [stateGame.players[0].id]: -10,
            [stateGame.players[1].id]: 10,
            tie: 0
        };
        this.boardDOM = boardDOM;
        this.stateBoard = stateBoard;
        this.stateGame = stateGame
    }
    updateTemporaryCellState ( { row, col }, playerId = 1 ) {
        this.stateBoard.setCellValue( { row, col }, this.stateGame.players[playerId].mark );
        this.stateGame.setLatestPosition( { row, col } );
    }
    // LET'S MAKE THE BOT MOVES!
    botMove () {
        if ( this.stateGame.findPlayerByProperty('isBot', true).id === this.stateGame.currentPlayer.id ) {
            let bestMoveScore = -Infinity;
            let possibleMoves = []

            for ( let row = 0; row < 3; row++ ) {
                for ( let col = 0; col < 3; col++ ) {

                    if ( this.stateBoard.isCellEmpty( { row, col } ) ) {
                        
                        this.updateTemporaryCellState( { row, col } );

                        let moveScore = this.miniMax( false );

                        this.stateBoard.resetCellValue( { row, col } );

                        if ( moveScore == bestMoveScore ) {
                            possibleMoves.push( { row, col } );

                        } else if ( moveScore > bestMoveScore ) {
                            possibleMoves = []
                            possibleMoves.push( { row, col } );
                            bestMoveScore = moveScore;
                        }
                    }
              }
          }
          console.log(possibleMoves)
          // add some randomness
          let randomness = Math.floor( Math.random() * possibleMoves.length );
          let randomPossibleMove = possibleMoves[ randomness ];

          this.stateBoard.setCellValue( randomPossibleMove, this.stateGame.players[1].mark );
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

                    if ( this.stateBoard.isCellEmpty( { row, col } ) ) {

                        this.updateTemporaryCellState( { row, col } );

                        let moveScore = this.miniMax( false );

                        this.stateBoard.resetCellValue( { row, col } );

                        bestMoveScore = Math.max( moveScore, bestMoveScore );
                    }
                }
            }

        } else {

            bestMoveScore = Infinity;

            for ( let row = 0; row < 3; row++ ) {
                for ( let col = 0; col < 3; col++ ) {
                    
                    if ( this.stateBoard.isCellEmpty( { row, col } ) ) {

                        this.updateTemporaryCellState( { row, col }, 0 );

                        let moveScore = this.miniMax( true );

                        this.stateBoard.resetCellValue( { row, col } );

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

        if ( this.stateBoard.findWinningMarkInBoard( this.stateGame.latestPosition ) ) {

            let latestCoords = this.stateGame.latestPosition;
            let optionalCellValue = this.stateBoard.getCellValue( { row: latestCoords.row, col: latestCoords.col } );
            optionalWinner = this.stateGame.findMarkOwner(optionalCellValue);
        }

        // get empty cells
        for ( let row = 0; row < 3; row++ ) {
            for ( let col = 0; col < 3; col++ ) {
                
                if ( !this.stateBoard.getCellValue( { row, col } ) )
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