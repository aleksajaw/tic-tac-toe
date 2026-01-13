import { Player } from './Player.js';
import { BotMoveGenerator } from './BotMoveGenerator.js';

export class GameState {
    constructor ( isSinglePlayer = true) {
        this.loading = false;
        this.players = [ 
            new Player( 1, 'X', 'player 1', false ),
            new Player( 2, 'O', isSinglePlayer ? 'computer' : 'player 2', isSinglePlayer )
        ];
        this.currentPlayer = null;
        this.setDefaultCurrentPlayer();
        this.latestTurn = { coords: { row: null, col: null },
                              mark: null };
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
        this.currentPlayer = this.findPlayerById(1);
    }
    setWinner ( player ) {
        this.winner = player;
    }
    setCurrentGameMessage ( text ) {
        this.currentGameMessage = text;
    }
    setLatestCoords ( coords = { row, col } ) {
        this.latestTurn.coords = coords;
    }
    setLatestMark ( mark ) {
        this.latestTurn.mark = mark;
    }
    setLatestTurn ( coords = { row, col}, mark ) {
        this.setLatestCoords( coords );
        this.setLatestMark( mark );
    }
    getLatestCoords () {
        return this.latestTurn.coords;
    }
    getLatestMark () {
        return this.latestTurn.mark;
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
            let winnerMark = board.findWinningMarkInBoard( this.getLatestCoords() );

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
    initSwitchModeButton ( moveGenerator ) {
        if ( !(moveGenerator instanceof BotMoveGenerator) ) {
            return;
        }

        this.switchModeButton.addEventListener( 'click', () => {
            this.toggleGameMode();
            if ( this.isSinglePlayer ) {
                moveGenerator.updatePlayersIdThenMakeMove();
            }
        } );
    }
}