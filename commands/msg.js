//Allows Jay to send custom messages as the bot.
var Command = require("../command");

function sendMsg(message, channelID, content) {
    message.guild.channels.find(c => c.id == channelID).send(content);
}

module.exports = new Command("msg", (message, args) => {

    if (message.author.id == "274639466294149122") {
        //Is Jay/Cannicide

        if (!args || !args[0]) {
            message.reply("you did not specify a channel ID.")
        }
        else if (!args[1]) {
            message.reply("you did not specify a message to send.");
        }
        else {
            var content = args.join(" ").replace(" ", ";;split;;").split(";;split;;")[1];
            sendMsg(message, args[0], content);
        }
    }
    else {
        //Is not Jay
        message.reply("you do not have permission to access that command. Only Jay can use that command.");
    }

}, false, false, "Allows Jay to send custom messages as the bot.").attachArguments([
    {
        name: "channel ID",
        optional: false
    },
    {
        name: "message",
        optional: false
    }
]);