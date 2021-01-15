//Easily get role information (namely any role's ID)

var Command = require("../command");

module.exports = new Command("role", {
    desc: "Easily get role information such as a role ID",
    args: [
        {
            name: "role-name",
            feedback: "Please specify the name of the role to get information about."
        }
    ]
}, (message) => {

    var given = message.args.join(" ");
    var role = message.guild.roles.cache.find(r => r.name.toLowerCase() == given.toLowerCase());

    if (role) {
        message.channel.embed({
            fields: [
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
            ],
            title: "Role Info"
        });

    }
    else {
        message.reply(`could not find the specified role \`${given}\` in this guild.`);
    }

});