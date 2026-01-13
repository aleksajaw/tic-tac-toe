import { BoardInDOM, BoardState, BotMoveGenerator, GameState } from './classes/index.js';


let ticTacToe = null;
let gameBoardState = null;
let gameBoardDOM = null;
let botGenerator = null;


function initGame () {

    if ( ticTacToe === null || !ticTacToe.loading ) {

        ticTacToe = (ticTacToe === null) ? new GameState()
                                         : new GameState( ticTacToe.isSinglePlayer );
        
        ticTacToe.setLoading(true);

        gameBoardState = new BoardState();
        gameBoardDOM = new BoardInDOM( gameBoardState, ticTacToe );

        botGenerator = new BotMoveGenerator(gameBoardDOM, gameBoardState, ticTacToe);
        
        gameBoardDOM.setMoveGenerator( botGenerator );

        ticTacToe.initSwitchModeButton( botGenerator );

        ticTacToe.changeCurrentGameMessage();
        ticTacToe.setLoading(false);
    }
}


document.addEventListener('DOMContentLoaded',  () => {

    initGame();
    document.getElementById('gameReset').addEventListener( 'click', () => initGame() );
})