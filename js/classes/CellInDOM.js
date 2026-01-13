export class CellInDOM {
    constructor ( coords = { row, col }, parentBoardDOM, parentBoardState, stateGame ) {
        this.parentBoardDOM = parentBoardDOM;
        this.parentBoardState = parentBoardState;
        this.stateGame = stateGame;

        this.HTMLNode = Object.assign( document.createElement('input'), {
            type: 'text',
            className: 'cell',
            readOnly: true
        } );

        this.setDatasetAndAria( coords );

        this.HTMLNode.addEventListener( 'click', () => {
            this.updateOnClick( coords );
        } );
    }
    setValue ( val ) {
        this.HTMLNode.value = val;
    }
    getValue () {
        return this.HTMLNode.value;
    }
    isEmpty () {
        return this.getValue() === ''; 
    }
    setDisabled ( bool ) {
        this.HTMLNode.disabled = bool;
    }
    getDataSet () {
        return this.HTMLNode.dataset;
    }
    setDatasetAndAria ( { row, col } = {} ) {
        Object.assign( this.HTMLNode.dataset, { row: row, col: col } );
        this.HTMLNode.ariaLabel = `Cell in row ${row + 1}, column ${col + 1}`;
    }
    applyMarkToCell ( coords = { row, col } ) {
        let currentPlayerMark = this.stateGame.currentPlayer.mark;
        this.setValue( currentPlayerMark );
        this.setDisabled(true);
        this.parentBoardState.setCellValue( coords, currentPlayerMark );
        this.stateGame.setLatestPosition( coords );
    }
    updateOnClick( coords = { row, col } ) {
        this.stateGame.toggleDisabledSwitchModeButton();
        this.applyMarkToCell( coords );

        // HAS WINNER OR TIE
        if ( this.stateGame.determineWinner( this.parentBoardState )
           || !this.parentBoardState.hasEmptyCells() ) {

                this.parentBoardDOM.toggleCellsDisabled( { force: true } );
                this.stateGame.changeCurrentPlayer();
                this.stateGame.toggleDisabledSwitchModeButton();

        } else {
            // BOT MOVE
            if ( this.stateGame.players[1].isBotOpponentFor( this.stateGame.currentPlayer ) ) {

                this.parentBoardDOM.toggleCellsDisabled( { force: true } );
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