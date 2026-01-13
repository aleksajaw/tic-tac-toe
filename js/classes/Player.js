export class Player {
    constructor ( id = null, mark = null, name = null, isBotModeActive = false ) {
        this.id = id;
        this.mark = mark;
        this.name = null;
        this.isBotModeActive = isBotModeActive;
        this.botModeDetails = { name: 'computer',
                                returnName: name };
        this.setCurrentName();
    }
    setName ( name = '') {
        this.name = name;
    }
    setCurrentName () {
        this.name = this.isBotModeActive ? this.botModeDetails.name
                                         : this.botModeDetails.returnName;
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
        this.setCurrentName();
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