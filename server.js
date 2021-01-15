const Handler = require("./handler");
const intents = ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGES", "GUILD_PRESENCES"];
const client = new Handler.Client({
    intents: intents,
    name: "ZH Discord Bot",
    presences: ["Slaying Zombies", "FLAMETHROWER!", "Molotovs: Just 25 Gold!", "A Cure?", "Braaiiinnnnsssss", "/help", "/help", "/help"],
    logs: {
        guildID: "668485643487412234",
        channelName: "logs"
    }
});

var Interpreter = require("./interpreter");

//Setup website
require("./website").setup(Handler.express, client);

//Log guild joins
client.on('guildCreate', guild => {
    client.logs.send("ZH Discord Bot was added to the guild: " + guild.name);
});

//Initialize everything on bot ready
client.once('ready', () => {
    console.log('ZH Discord Bot is up and running!');

    client.logs.edit("678657509296439353", "ZH Discord Bot is up and running again on the optimal port.\nAs of: " + new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}) + " EST");
    
    //Initialize command handler
    client.commands.initialize("commands");

    //Fetch reaction interpreters:
    Interpreter.initialize(client);

    //Setup suggestion reactions:
    Interpreter.register({
        type: "message",
        filter: (m, args) => args[0].toLowerCase().match("suggestion:") && m.channel.name.toLowerCase().match("suggestions"),
        response: (message) => {
            message.react("713053971757006950")
            .then(r => {
                message.react("713053971211878452");
            });
        }
    });

    //Register poll interpreters:
    const polls = require("./commands/poll");
    polls.initialize();

    //Setup statistics logger and scheduler
    var statistics = require("./commands/statistics");
    statistics.logger(client);
    statistics.scheduler(client);

    //Setup giveaway scheduler
    require("./commands/giveaway.js").giveawayScheduler(client);

});

//Setup message event listener
client.on('message', message => {
    try {

        // Avoid bot messages, DM and otherwise:
        if (message.author.bot) return false;

        // DM determination:
        if (message.guild === null) {
            
            //Interpret for DiscordSRZ code
            Interpreter.dm(message, message.content.split(" "));

            return false;
        }

        //Handle command:
        var cmd = client.commands.handle(message);

        //Handle messages to be interpreted:
        if (!cmd) {
            Interpreter.message(message, message.content.split(" "));
        }

    }
    catch (err) {
        message.channel.send(`Errors found:\n\`\`\`${err}\nAt ${err.stack}\`\`\``);
    }
});

client.on("messageReactionAdd", (r, user) => {
    Interpreter.reaction(r, user, true);
});

client.on("messageReactionRemove", (r, user) => {
    Interpreter.reaction(r, user, false);
});

//Added token
client.login(process.env.TOKEN);