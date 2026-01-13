export class BotMoveGenerator {
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
    updateTemporaryCellState ( coords = { row, col }, playerId ) {
        let playerMark = this.stateGame.findPlayerById( playerId ).mark;
        this.stateBoard.setCellValue( coords, playerMark );
        this.stateGame.setLatestTurn( coords, playerMark );
    }
    updatePlayersIdThenMakeMove () {
      this.updatePlayersId();
      this.makeMove();
    }
    // LET'S MAKE THE BOT MOVES!
    makeMove () {
        let botId = this.stateGame.findBotPlayer().id;
        let currentPlayerId = this.stateGame.currentPlayer.id;
        
        if ( botId === currentPlayerId ) {
            let possibleMoves = [];

            let bestMoveScore = -Infinity;

            for ( let row = 0; row < 3; row++ ) {
                for ( let col = 0; col < 3; col++ ) {

                    let coords = { row, col };

                    if ( this.stateBoard.isCellEmpty( coords ) ) {
                        
                        this.updateTemporaryCellState( coords, this.playersId.bot);

                        let moveScore = this.miniMax( false );

                        this.stateBoard.resetCellValue( coords );

                        if ( moveScore == bestMoveScore ) {
                            possibleMoves.push( coords );

                        } else if ( moveScore > bestMoveScore ) {
                            possibleMoves = []
                            possibleMoves.push( coords );
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

                let coords = { row, col };

                if ( this.stateBoard.isCellEmpty( coords ) ) {

                    this.updateTemporaryCellState( coords, playerId );

                    let moveScore = this.miniMax( !isMaximizing );

                    this.stateBoard.resetCellValue( coords );

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
        let latestCoords = this.stateGame.getLatestCoords();
        let hasWinnerLine = this.stateBoard.findWinningMarkInBoard( latestCoords ) !== null;

        if ( hasWinnerLine ) {
            let latestMark = this.stateGame.getLatestMark();
            optionalWinnerType = this.stateGame.findPlayerByMark( latestMark ).isBot() ? 'bot'
                                                                                       : 'human';
        }
        
        return ( !optionalWinnerType && !this.stateBoard.hasEmptyCells() )
            ? 'tie'
            : optionalWinnerType;
    }
}