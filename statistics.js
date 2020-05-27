var ping = require("minecraft-server-util");
var Command = require("./command");
var Interface = require("./interface");

function getServerInfo(callback) {

    var info = {
        players: 0,
        icon: "",
        version: "",
    }

    ping("server.zombiehorde.net", 25565)
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

        var memOnline = message.guild.members.filter(m => m.presence.status != 'offline').size;
        var memTotal = message.guild.memberCount;
        var memPercent = memOnline / memTotal * 100;

        let embed = new Interface.Embed(message, message.guild.iconURL, [
            {
                name: "Minecraft Server",
                value: `Players Online: ${info.players}\nVersion: 1.8.x-1.12.x`
            },
            {
                name: "Discord Server",
                value: `Total Member Count: ${memTotal} users\nTotal Online Members: ${memOnline}\nPercent of Members Online: ${Math.round(memPercent)}%`
            }
        ]);

        embed.embed.title = "**Statistics**";
        message.channel.send(embed);

        //message.channel.send("**Statistics**\n\nPlayers Online: " + info.players + "\nVersion: " + "1.8.x-1.12.x");//info.version);

    });

        

}, false, false, "View discord and minecraft server statistics.");