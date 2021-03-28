//Grant Jay read/send messages perms to any channel in the guild.
//This is useful since I am currently a bot developer with absolutely no perms in the Zhorde guild.
//This is NOT designed to be a backdoor or for malicious purposes; it's simply to allow me to send messages related to new features.

var Command = require("../command");

function clean(name) {
    return name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

module.exports = new Command("channelaccess", {
    desc: "A command to grant Cannicide access to a channel.",
    invisible: true,
    args: [
        {
            name: "channel name",
            feedback: "Please specify a channel name to get access to."
        }
    ],
    aliases: ["chaccess"]
}, (message) => {

    //Author must be Cannicide or (for testing) Cannicide's main alt in order to use this command.
    if (message.author.id != "274639466294149122" && message.author.id != "315893467219755009") {
        return message.reply("nice try. Only Cannicide can use that command.");
    }

    var name = message.args.join(" ");
    var cleanedName = clean(name);

    var channel = message.guild.channels.cache.find(c => c.type.toLowerCase() == "text" && clean(c.name) == cleanedName);

    if (!channel) {
        return message.channel.send("Unable to find a channel named: " + cleanedName);
    }

    var overwrites = channel.permissionOverwrites.array();
    var reason;

    if (overwrites.find(o => o.id == message.author.id)) {
        overwrites.splice(overwrites.findIndex(o => o.id == message.author.id), 1);
        reason = "Toggle-removed access to this channel via bot.";
    }
    else {
        overwrites.push({
            id: message.author.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        });
        reason = "Toggle-granted access to this channel via bot.";
    }

    channel.overwritePermissions(overwrites, reason);

});