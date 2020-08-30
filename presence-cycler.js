//Cycle through various presences instead of a single discord presence.

function PresenceHandler(client) {

    /**
     * 
     * @param {Presence} presence 
     */
    this.set = (presence) => {
        client.user.setActivity(presence.get(), { type: 'STREAMING', url: 'https://twitch.tv/cannicide' });
    }

}

var index = 0;

/**
 * A randomized presence message.
 * @returns {Presence}
 */
function Presence() {

    var options = ["Slaying Zombies", "FLAMETHROWER!", "Molotovs: Just 25 Gold!", "A Cure?", "Braaiiinnnnsssss", "/help", "/help", "/help"]
    var selected = options[index];
    index += 1;

    this.get = () => {
        return selected;
    }
}

module.exports = {
    PresenceHandler: PresenceHandler,
    Presence: Presence
}