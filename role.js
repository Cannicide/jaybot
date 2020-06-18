//Easily get role information (namely any role's ID)

var Command = require("./command");
var Interface = require("./interface");

module.exports = new Command("role", (message, args) => {

    var given = args.join(" ");
    var role = message.guild.roles.find(r => r.name.toLowerCase() == given.toLowerCase());

    if (role) {
        var embed = new Interface.Embed(message, "", [
            {
                name: "Role Name",
                value: role.name
            },
            {
                name: "Role ID",
                value: role.id
            },
            {
                name: "Role Color",
                value: role.color
            }
        ]);

        embed.embed.title = "Role Info";
        message.channel.send(embed);

    }
    else {
        message.reply(`could not find the specified role \`${given}\` in this guild.`);
    }

}, false, false, "Easily get role information such as a role ID").attachArguments([
    {
        name: "role-name",
        optional: false
    }
])