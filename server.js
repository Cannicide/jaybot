const express = require('express');
const app = express();

app.use(express.static('public'));
app.get('/', function(request, response) {
  response.send("Running botserver");
});

const listener = app.listen(process.env.PORT, function() {
  console.log('ZH Discord Bot listening on port ' + listener.address().port);
});

//Discord.js initialized
const Discord = require('discord.js');
const client = new Discord.Client();
var prefix = "/";

var interface = require("./interface");
interface.setClient(Discord);

client.on('guildCreate', guild => {
    var guildX = client.guilds.get("668485643487412234");
    guildX.channels.get(guildX.channels.find("name", "logs").id).send("ZH Discord Bot was added to the guild: " + guild.name);
});

var commands = [];

client.on('ready', () => {
    console.log('ZH Discord Bot is up and running!');
    //Allows the status of the bot to be PURPLE (I don't stream on twitch anyways)
    client.user.setActivity('/help', { type: 'STREAMING', url: 'https://twitch.tv/cannicide' });
    var guild = client.guilds.get("668485643487412234");
    guild.channels.get(guild.channels.find("name", "logs").id).send("ZH Discord Bot is now operational and listening on the optimal port.");

    //Import commands:
    commands.push({name: "faq", cmd: require("./faq")});
});

client.on('message', message => {
    try {

        var splitter = message.content.replace(" ", ";:splitter185151813367::");
        var splitted = splitter.split(";:splitter185151813367::");
        if (message.guild === null) {
            if (message.author.id != client.user.id) {
                message.reply("Sorry " + message.author.username + ", DM messages are not supported by this bot.");
            }
            return false;
        }

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

        if (message.author.bot) {
            return false;
        }

        //Check for command:
        var cmd = false;

        commands.forEach((item, index) => {
            if (item.name == command) {
                cmd = item.cmd;
            }
        });

        if (cmd) {
            cmd.set(message);
            cmd.execute(args).catch((err) => {
                message.reply("An error occurred: " + err);
            });
        }

    }
    catch (err) {
        message.channel.send(`Errors found:\n\`\`\`${err}\nAt ${err.stack}\`\`\``);
    }
});

//Added token
client.login(process.env.TOKEN);