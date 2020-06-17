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

var stats = new Command("statistics", (message, args) => {

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

const fs = require("fs");
var storageSrc = __dirname + "/storage/" + "statistics" + ".json";;

function getLS() {
    try {
        //Gets json file, and converts into JS object
        var storage = JSON.parse(fs.readFileSync(storageSrc));
    }
    catch (err) {
        console.log("Reading JSON was not possible due to error: " + err);
        return false;
    }


   //Returns the storage object
   return storage;
}

function setLS(newStorage) {

    //Updates json file with new config additions/updates
    fs.writeFileSync(storageSrc, JSON.stringify(newStorage, null, "\t"));
}

function logStatistics(client) {
    var guild = client.guilds.get("351824506773569541");

    setInterval(() => {

        var fulldate = new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York'
        });
        
        let parts = fulldate.split(", ");

        var date = parts[0];
        var fulltime = parts[1];

        //Time:

        var time = {
            raw: fulltime.split(" ")[0],
            ampm: fulltime.split(" ")[1]
        }
        time.hours = Number(time.raw.split(":")[0]);
        time.mins = Number(time.raw.split(":")[1]);
        time.secs = time.raw.split(":")[2];

        if (time.ampm == "PM" && time.hours != 12) {
            time.hours += 12;
        }
        else if (time.ampm == "AM" && time.hours == 12) {
            time.hours = 0;
        }

        //Get storage and fetch stats:

        var obj = getLS();
        var response = {};

        if (!(date in obj)) {
            obj[date] = {};
          }

        if (time.mins == 0 && !(time.hours in obj[date])) {
            getServerInfo((info) => {

                response.onlineDiscordMembers = guild.members.filter(m => m.presence.status != 'offline').size;
                response.totalDiscordMembers = guild.memberCount;
                response.percentDiscordOnline = memOnline / memTotal * 100;

                response.onlineMinecraftPlayers = info.players;
                response.recordedTime = fulltime;

                //Set storage

                obj[date][time.hours] = response;
                setLS(obj);
            });
        }

    }, 60 * 1000);

}

module.exports = {
    command: stats,
    logger: logStatistics
}