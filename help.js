var Command = require("./command");
var Interface = require("./interface")

module.exports = new Command("help", (message, args) => {

    var cmds = new Command().getCommands();
    var prefix = args[0];
    var fields = [];

    cmds.forEach((item) => {
        if (!item.special) {
            var res = {
                name: "",
                value: ""
            };
            res.name = item.name.charAt(0).toUpperCase() + item.name.substring(1) + " Command";
            res.value = (item.desc ? item.desc + "\n" : "") + "```fix\n" + prefix + item.name;// + "\n";
            let params = item.cmd.getArguments();
            if (!params) {
                res.value += "```\n** **";
            }
            else {
                params.forEach((arg) => {
                    if ("optional" in arg && arg.optional == true) {
                        res.value += ` [${arg.name}]`;
                    }
                    else {
                        res.value += ` <${arg.name}>`;
                    }
                });
                res.value += "```\n** **";
            }
            res.inline = true;
            fields.push(res);
        }
    });

    let thumb = "https://cdn.discordapp.com/attachments/372124612647059476/431626525809573898/ZHFinal.png";
    let embed = new Interface.Embed(message, thumb, fields);
    embed.embed.title = "**Commands**";
    embed.embed.description = "ZhordeBot is the official Zombie Horde Discord Bot, created by Cannicide#2753 (JayCraft2)."

    message.channel.send(embed);

}, false, false, "Gets a list of all commands, parameters, and their descriptions. Format: [optional] parameters, <required> parameters.");