const util = require("minecraft-server-util");
const ping = util.status;
var Command = require("../command");

function getServerInfo(callback, err) {

    var info = {
        players: 0,
        icon: "",
        version: "",
    }

    ping("server.zombiehorde.net")
        .then((response) => {
            info.players = response.onlinePlayers;
            info.icon = response.favicon;
            info.version = response.version;
            return callback(info);
        })
        .catch((error) => {
            console.log(error);
            if (err) err();
        });
}

var stats = new Command("statistics", {
    desc: "View discord and minecraft server statistics.",
    cooldown: 30,
    aliases: ["stats"]
}, (message) => {

    getServerInfo((info) => {

        var memOnline = message.guild.members.cache.filter(m => m.presence.status != 'offline').size;
        var memTotal = message.guild.memberCount;
        var memPercent = memOnline / memTotal * 100;

        message.channel.embed({
            desc: "View all statistics [here](https://panaceapp.glitch.me/statistics)",
            title: "**Statistics**",
            thumbnail: message.guild.iconURL({dynamic: true}),
            fields: [
                {
                    name: "Minecraft Server",
                    value: `Players Online: ${info.players}\nVersion: 1.8.x-1.12.x`
                },
                {
                    name: "Discord Server",
                    value: `Total Member Count: ${memTotal} users\nTotal Online Members: ${memOnline}\nPercent of Members Online: ${Math.round(memPercent)}%`
                }
            ]
        });

    }, (err) => {

        message.channel.embed({
            desc: "The server appears to be down.\nView all statistics [here](https://panaceapp.glitch.me/statistics)",
            title: "**Statistics**",
            thumbnail: message.guild.iconURL({dynamic: true})
        });

    });

        

});

var evg = require("../evg").remodel("statistics");

function logStatistics(client) {

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

        var response = {};

        if (!evg.has(date)) {
            evg.set(date, {});
          }

        if (time.mins == 0) {
            getServerInfo((info) => {

                var guild = client.guilds.cache.find(g => g.id == "351824506773569541");
                response.onlineDiscordMembers = guild.members.cache.filter(m => m.presence.status != 'offline').size;
                response.totalDiscordMembers = guild.memberCount;
                response.percentDiscordOnline = response.onlineDiscordMembers / response.totalDiscordMembers * 100;

                response.onlineMinecraftPlayers = info.players;
                response.recordedTime = fulltime;

                //Set storage
                evg.table(date).set(time.hours, response);
            });
        }

    }, 1 * 60 * 1000);

}

//Scheduler automatically updates parts of the discord with minecraft/guild info and stats
function scheduler(client) {
    var previousName = false;

    setInterval(() => {

        getServerInfo(async (info) => {

            var guild = client.guilds.cache.find(g => g.id == "351824506773569541");

            var msg = false;
            const category = guild ? guild.channels.cache.get("728978616905367602") : false;

            const channelPerms = [
                {
                    //@everyone
                    id: "351824506773569541",
                    deny: ["CONNECT", "SPEAK"],
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    //@System Administrator
                    id: "627599099184807966",
                    allow: ["CONNECT", "SPEAK"]
                }
            ];

            //Bypasses channel renaming limits and avoids random Discord API channel dupe glitches
            if (guild && (info.players || info.players == 0)) msg = `${info.players} ${info.players == 1 ? "person is" : "people are"}`;
            if (msg && msg != previousName) {

                //Remove all channels in category
                category.children.each(channel => channel.delete("[Statistics]"));

                previousName = msg;

                //Create new channel for # players online
                guild.channels.create(msg, {
                    parent: category,
                    permissionOverwrites: channelPerms,
                    type: "voice",
                    reason: "[Statistics]"
                })
                .then(channel => {
                    //Then create new channel for "playing ZombieHorde.net!"
                    guild.channels.create("playing ZombieHorde.net!", {
                        parent: category,
                        permissionOverwrites: channelPerms,
                        type: "voice",
                        reason: "[Statistics]"
                    });
                });

            }

            // const oldChannel = category.children.find(c => c.position == 0);

            // //Cloning method bypasses channel renaming limits
            // if (guild && oldChannel && (info.players || info.players == 0)) msg = `${info.players} ${info.players == 1 ? "person is" : "people are"}`;
            // if (oldChannel && msg && oldChannel.name != msg) {
            //     const channel = await oldChannel.clone({name: msg, reason: "[Statistics]"});
            //     channel.setPosition(0).catch(err => console.log(err));; 

            //     setTimeout(() => {oldChannel.delete("[Statistics]")}, 1000);
            // }

        });

    }, 1 * 60 * 1000);
}

module.exports = {
    command: stats,
    logger: logStatistics,
    scheduler: scheduler
}