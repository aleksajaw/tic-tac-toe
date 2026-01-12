class GameState {
    constructor ( isSinglePlayer = true) {
        this.loading = false;
        this.players = [ 
            new Player( 1, 'X', 'player 1', false ),
            new Player( 2, 'O', isSinglePlayer ? 'computer' : 'player 2', isSinglePlayer )
        ];
        this.currentPlayer = null;
        this.setDefaultCurrentPlayer();
        this.latestPosition = { row: null, col: null };
        this.winner = new Player();
        this.isSinglePlayer = isSinglePlayer;
        this.currentGameMessage = '';
        this.gameInfoContainer = document.getElementById('gameInfo');
        this.switchModeButton = document.getElementById('switchGameMode');
    }
    setLoading ( bool ) {
        this.loading = bool;
    }
    setCurrentPlayer ( player ) {
        this.currentPlayer = player;
    }
    setDefaultCurrentPlayer () {
        this.currentPlayer = this.findPlayerByPropertyEqualTo('id', 1);
    }
    setWinner ( player ) {
        this.winner = player;
    }
    setCurrentGameMessage ( text ) {
        this.currentGameMessage = text;
    }
    setLatestPosition ( coords = { row, col } ) {
        this.latestPosition = coords;
    }
    findOpponent () {
        return this.players.find( player => !player.matchesId( this.currentPlayer ) );
    }
    findBotPlayer () {
        return this.players.find( player => player.isBot() );
    }
    findNotBotPlayer () {
        return this.players.find( player => !player.isBot() );
    }
    findPlayerByMark ( mark ) {
        return this.findPlayerByPropertyEqualTo( 'mark', mark );
    }
    findPlayerById ( id ) {
        return this.findPlayerByPropertyEqualTo( 'id', id );
    }
    findPlayerByPropertyEqualTo ( property, value ) {
        return this.players.find( player => player.isPropertyEqualTo( property, value) );
    }
    changeCurrentPlayer ( nextPlayer ){
        if ( !(nextPlayer instanceof Player) ) {
            nextPlayer = new Player();
        }
        
        this.setCurrentPlayer( nextPlayer );
        this.changeCurrentGameMessage();
    }
    // WHOSE TURN
    switchCurrentPlayer () {
        let nextPlayer = this.findOpponent();
        
        this.changeCurrentPlayer(nextPlayer);
    }
    isGameOver () {
        return this.hasWinner() || this.currentPlayer.isDefault();
    }
    updateGameInfoContainer ( text ) {
        text = text.replace(/\n/g, '<br>');
        this.gameInfoContainer.innerHTML = text;
    }
    updateSwitchButtonText (text) {
        this.switchModeButton.innerHTML = text;
    }
    changeCurrentGameMessage () {
        let futureMessage = ( !this.hasWinner() )
                              ? ''
                              : 'The winner is: ' + this.winner.name + '.\n';

        futureMessage += ( !this.isGameOver() )
                              ? "We're waiting for: " + this.currentPlayer.name
                              : 'Click "Reset\u00A0game" to\u00A0play\u00A0again.';
        
        this.setCurrentGameMessage( futureMessage );
        this.updateGameInfoContainer( this.currentGameMessage );
    }
    determineWinner ( board ) {
        if ( board.hasEnoughFilledCells() ) {
            let latestCoords = this.latestPosition;
            let winnerMark = board.findWinningMarkInBoard( latestCoords );

            if ( winnerMark !== null ) {
                let newWinner = this.currentPlayer;
                this.setWinner( newWinner );
            }
        }
        return this.hasWinner();
    }
    hasWinner () {
        return !this.winner.isDefault();
    }
    toggleGameMode ( mark = 'O' ) {
        this.toggleOpponentBotMode();
        this.toggleIsSinglePlayer();
        this.toggleSwitchModeButtonText(mark);
    }
    toggleOpponentBotMode ( mark = 'O' ) {
        this.findPlayerByMark( mark ).toggleBotMode();
    }
    toggleIsSinglePlayer () {
        this.isSinglePlayer = !this.isSinglePlayer;
    }
    toggleSwitchModeButtonText ( mark = 'O' ) {
        let text = this.isSinglePlayer ? 'Play with Friend'
                                       : 'Make "' + mark + '" a Bot';
        this.updateSwitchButtonText( text );
    }
    toggleDisabledSwitchModeButton ( ) {
        this.switchModeButton.disabled = !this.switchModeButton.disabled;
    }
    initSwitchModeButton ( botObj ) {
        if ( !(botObj instanceof BotMoveBase) ) {
            return;
        }

        this.switchModeButton.addEventListener( 'click', () => {
            this.toggleGameMode();
            if ( this.isSinglePlayer ) {
                botObj.updatePlayersIdThenBotMove();
            }
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
        this.name = name;
    }
    isDefault () {
        return this.id === null
            && this.mark === null
            && this.name === null;
    }
    isBot () {
        return this.isBotModeActive;
    }
    toggleBotMode () {
        this.isBotModeActive = !this.isBotModeActive;
        let newName = this.isBotModeActive ? this.botModeDetails.defaultName
                                           : this.name;
        this.setName( newName );
    }
    isPropertyEqualTo ( name = 'id', value = null) {
        return this[name] === value;
    }
    isPropertyNotEqualTo ( name = 'id', value = null) {
        return this[name] !== value;
    }
    matchesId ( anotherPlayer ) {
        if ( !(anotherPlayer instanceof Player) ) {
            return null;
        }

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
        return this.matrixState[row][col];
    }
    isCellEmpty ( { row, col } ) {
        return !this.getCellValue( { row, col } );
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount;
    }
    reduceEmptyCells () {
        this.setEmptyCells( this.emptyCells - 1 );
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
    findWinningMarkInBoard ( latestCoords ) {
        return this.findWinningMarkInCross( latestCoords )
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
            this.updateOnClick( { row, col } );
        } );
    }
    setValue ( val ) {
        this.HTMLNode.value = val;
    }
    getValue () {
        return this.HTMLNode.value;
    }
    setDisabled ( bool ) {
        this.HTMLNode.disabled = bool;
    }
    getDataSet () {
        return this.HTMLNode.dataset;
    }
    setDatasetAndAria ( { row, col } ) {
        Object.assign( this.HTMLNode.dataset, { row: row, col: col } );
        this.HTMLNode.ariaLabel = `Cell in row ${row + 1}, column ${col + 1}`;
    }
    applyMarkToCell ( { row, col } ) {
        let currentPlayerMark = this.stateGame.currentPlayer.mark;
        this.setValue( currentPlayerMark );
        this.setDisabled(true);
        this.parentBoardState.setCellValue( { row, col }, currentPlayerMark );
        this.parentBoardState.reduceEmptyCells();
        this.stateGame.setLatestPosition( { row, col } );
    }
    updateOnClick( { row, col } ) {
        this.stateGame.toggleDisabledSwitchModeButton();
        this.applyMarkToCell( { row, col } );

        // HAS WINNER OR TIE
        if ( this.stateGame.determineWinner( this.parentBoardState )
           || !this.parentBoardState.hasEmptyCells() ) {

                this.parentBoardDOM.toggleCellsDisabled(true);
                this.stateGame.changeCurrentPlayer();
                this.stateGame.toggleDisabledSwitchModeButton();

        } else {
            // BOT MOVE
            let opponentMark = this.stateGame.players[1].mark;
            let opponentIsBot = this.stateGame.players[1].isBot();

            if ( this.stateGame.currentPlayer.mark !== opponentMark
              && opponentIsBot ) {
                
                this.parentBoardDOM.toggleCellsDisabled(true);
                this.stateGame.switchCurrentPlayer();
                this.stateGame.setLoading(true);

                setTimeout( () => {
                    this.parentBoardDOM.toggleCellsDisabled();
                    botMoveObj.botMove();
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
        this.cells = [];
        this.generateBoard();
    }
    addCell ( cell ) {
        this.cells.push( cell );
    }
    resetBoardDOM () {
        if ( this.boardDOM.hasChildNodes() ) {
            this.boardDOM.innerHTML = '';
        }
    }
    createCellWithDOM ( cell, { row, col } ) {
        cell = new CellInDOM( { row, col }, this, this.stateBoard, this.stateGame );
        this.addCell( cell );
        this.boardDOM.appendChild( cell.HTMLNode );
    }
    generateBoard () {
        this.resetBoardDOM();
        let cell = null;
    
        for ( let row = 0; row < 3; row++ ) {
            for ( let col = 0; col < 3; col++ ) {

                this.createCellWithDOM( cell, { row, col } );
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
        let targetCell = this.cells.find( cell => ( parseInt(cell.getDataSet().row) === row
                                                 && parseInt(cell.getDataSet().col) === col ) );
        if ( targetCell ) {
            targetCell.HTMLNode.click();
        }
    }
}



class BotMoveBase {
    constructor ( boardDOM, stateBoard, stateGame ) {
        this.botMoveScores = {
            human: -10,
            bot: 10,
            tie: 0
        };
        this.playersId = {
            human: null,
            bot: null
        }
        this.boardDOM = boardDOM;
        this.stateBoard = stateBoard;
        this.stateGame = stateGame;
        this.updatePlayersId();
    }
    updatePlayersId () {
        // There is always at least one human in a game.
        this.playersId.human = this.stateGame.findNotBotPlayer().id;
        let botPlayer = this.stateGame.findBotPlayer();
        if ( botPlayer != null ) {
            this.playersId.bot = botPlayer.id;
        }
    }
    updateTemporaryCellState ( { row, col }, playerId ) {
        let playerMark = this.stateGame.findPlayerById( playerId ).mark;
        this.stateBoard.setCellValue( { row, col }, playerMark );
        this.stateGame.setLatestPosition( { row, col } );
    }
    updatePlayersIdThenBotMove () {
      this.updatePlayersId();
      this.botMove();
    }
    // LET'S MAKE THE BOT MOVES!
    botMove () {
        let botId = this.stateGame.findBotPlayer().id;
        let currentPlayerId = this.stateGame.currentPlayer.id;
        
        if ( botId === currentPlayerId ) {
            let possibleMoves = [];

            let bestMoveScore = -Infinity;

            for ( let row = 0; row < 3; row++ ) {
                for ( let col = 0; col < 3; col++ ) {

                    if ( this.stateBoard.isCellEmpty( { row, col } ) ) {
                        
                        this.updateTemporaryCellState( { row, col }, this.playersId.bot);

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
          console.log(possibleMoves);
          // add some randomness
          let randomness = Math.floor( Math.random() * possibleMoves.length );
          let randomPossibleMove = possibleMoves[ randomness ];

          this.boardDOM.clickSpecificCell( randomPossibleMove );
        }
    }
    // MINIMAX ALGORITHM
    miniMax ( isMaximizing ) {

        let optionalWinner = this.findOptionalWinner();

        if ( optionalWinner !== null ) {
            return this.botMoveScores[optionalWinner];
        }
        
        let bestMoveScore = this.miniMaxRepeatablePart( isMaximizing );

        return bestMoveScore;
    }
    miniMaxRepeatablePart ( isMaximizing ) {
        let playerId = isMaximizing ? this.playersId.bot
                                    : this.playersId.human;
                                    
        let bestMoveScore = isMaximizing ? -Infinity
                                         : +Infinity;

        for ( let row = 0; row < 3; row++ ) {
            for ( let col = 0; col < 3; col++ ) {

                if ( this.stateBoard.isCellEmpty( { row, col } ) ) {

                    this.updateTemporaryCellState( { row, col }, playerId );

                    let moveScore = this.miniMax( !isMaximizing );

                    this.stateBoard.resetCellValue( { row, col } );

                    bestMoveScore = isMaximizing ? Math.max( moveScore, bestMoveScore )
                                                 : Math.min( moveScore, bestMoveScore );
                }
            }
        }
        return bestMoveScore;
    }
    // HELPER FOR MINIMAX ALGORITHM
    findOptionalWinner () {

        let optionalWinnerType = null;
        let optionalEmptyCells = 0;
        let latestCoords = this.stateGame.latestPosition;
        let hasWinnerLine = this.stateBoard.findWinningMarkInBoard( latestCoords ) !== null;

        if ( hasWinnerLine ) {
            let optionalCellValue = this.stateBoard.getCellValue( { row: latestCoords.row, col: latestCoords.col } );
            optionalWinnerType = this.stateGame.findPlayerByMark(optionalCellValue).isBot() ? 'bot'
                                                                                            : 'human';
        }

        // get empty cells
        for ( let row = 0; row < 3; row++ ) {
            for ( let col = 0; col < 3; col++ ) {
                
                if ( !this.stateBoard.getCellValue( { row, col } ) ) {
                    optionalEmptyCells += 1;
                }
            }
        }
        
        return ( !optionalWinnerType && !optionalEmptyCells )
            ? 'tie'
            : optionalWinnerType;
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