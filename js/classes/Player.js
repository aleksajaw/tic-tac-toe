export class Player {
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
    isOpponentFor ( anotherPlayer ) {
        return !this.matchesId( anotherPlayer );
    }
    isBotOpponentFor ( anotherPlayer ) {
        return this.isBot() && this.isOpponentFor( anotherPlayer );
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