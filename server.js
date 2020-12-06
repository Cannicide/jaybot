const express = require('express');
const app = express();
const fs = require("fs");

app.use(express.static('public'));

const listener = app.listen(process.env.PORT, function() {
  console.log('ZH Discord Bot listening on port ' + listener.address().port);
});

//Discord.js initialized
const Discord = require('discord.js');
const intents = ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGES", "GUILD_PRESENCES"];
const client = new Discord.Client({intents: intents, ws:{intents: intents}});
var prefix = "/";

require("./website").setup(app, client);

var inface = require("./interface");
inface.setClient(Discord);

var Interpreter = require("./interpreter");
var Command = require("./command");
var Alias = require("./alias");
var Cycler = require("./presence-cycler");

const PresenceHandler = new Cycler.PresenceHandler(client);

var ranks = require("./commands/rank");

var statistics = require("./commands/statistics");
statistics.logger(client);
statistics.scheduler(client);

client.on('guildCreate', guild => {
    var guildX = client.guilds.cache.get("668485643487412234");
    guildX.channels.cache.get(guildX.channels.cache.find(c => c.name == "logs").id).send("ZH Discord Bot was added to the guild: " + guild.name);
});

var commands = [];

/**
* @type Command[]
*/
var requisites = [];

client.on('ready', () => {
    console.log('ZH Discord Bot is up and running!');

    //Allows the status of the bot to be PURPLE (I don't stream on twitch anyways)
    var presence = new Cycler.Presence();
    PresenceHandler.set(presence);

    //Cycles the presence every 10 minutes
    setInterval(() => {
        var presence = new Cycler.Presence();
        PresenceHandler.set(presence);
    }, 10 * 60 * 1000);

    var guild = client.guilds.cache.get("668485643487412234");
    guild.channels.cache.get(guild.channels.cache.find(c => c.name == "logs").id).messages.fetch("678657509296439353").then(msg => msg.edit("ZH Discord Bot is up and running again on the optimal port.\nAs of: " + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}) + " EST"));


    //Import commands:
    var cmdfiles = fs.readdirSync("commands");
    cmdfiles.forEach((item) => {
        var file = require(`./commands/${item.substring(0, item.length - 3)}`);
        if (file instanceof Command) {
            requisites.push(file);
        }
        else if ("commands" in file) {
            file.commands.forEach((alias) => {
                if (alias instanceof Command) requisites.push(alias);
                else if (alias instanceof Alias) requisites.push(alias.getAsCommand());
            })
        }
    });

    commands = requisites.find(c => c.getName() == "help").getCommands();
});

client.on('message', message => {
    try {

        // Avoid bot messages, DM and otherwise:

        if (message.author.bot) {
            return false;
        }

        //Create new interpreter
        var intp = new Interpreter(message);

        //Command determination:

        var splitter = message.content.replace(" ", ";:splitter185151813367::");
        var splitted = splitter.split(";:splitter185151813367::");

        var fixRegExp = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp(fixRegExp);

        var command = splitted[0].replace(re, "");
        command = command.toLowerCase();

        if (splitted[1]) {
            var args = splitted[1].split(" ");
        }
        else {
            var args = false;
        }

        // DM determination:

        if (message.guild === null) {
            if (splitted[0].match(prefix)) {
                message.reply("Sorry " + message.author.username + ", DM messages are not supported by this bot.");
            }
            else {
                //Interpret for DiscordSRZ code
                intp.interpretDM(message.content.split(" "), client);
            }

            return false;
        }

        //Ranking system:

        let system = ranks.system;
        if (!system.userExists(message)) {
            system.addUser(message);
        }

        system.addXP(5, message);

        //Check for command:
        var cmd = false;

        commands.forEach((item, index) => {
            if (item.name == command) {
                cmd = item.cmd;
            }
        });


        if (cmd && splitted[0].match(prefix)) {
            message.channel.startTyping();
            setTimeout(() => {
                cmd.set(message);
                if (cmd.matches("help")) {
                    cmd.execute([prefix, args]).catch((err) => {
                        message.reply("An error occurred: " + err);
                    });
                }
                else {
                    cmd.execute(args).catch((err) => {
                        message.reply("An error occurred: " + err);
                    });
                }
                message.channel.stopTyping();
            }, 1000);
        }
        else {
            intp.interpret(message.content.split(" "));
        }

    }
    catch (err) {
        message.channel.send(`Errors found:\n\`\`\`${err}\nAt ${err.stack}\`\`\``);
    }
});

client.on("messageReactionAdd", (r, user) => {
    intp.interpretReaction(r, user);
});

//Added token
client.login(process.env.TOKEN);