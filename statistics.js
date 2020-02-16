var ping = require("minecraft-server-util");
var Command = require("./command");

function getServerInfo(callback) {

    var info = {
        players: 0,
        icon: "",
        version: "",
    }

    ping(process.env.ZHORDE, 25565)
        .then((response) => {
            info.players = response.getPlayersOnline();
            info.icon = response.getFavicon();
            info.version = response.getVersion();
            return callback(info);
        })
        .catch((error) => {
            console.log(error);
        });
}

module.exports = new Command("statistics", (message, args) => {

    getServerInfo((info) => {

        message.channel.send("**Statistics**\n\nPlayers Online: " + info.players + "\nVersion: " + info.version);

    });

}, false);