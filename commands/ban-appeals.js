//A command to allow players to appeal their bans, showing them the proper way of doing so
/*Ban appeal creation:*/ const banThread = "https://zhorde.net/forums/ban-appeals.17/create-thread?title=_%27s+Ban+Appeal"
/*Ban appeal format:*/ const banFormat = "https://zhorde.net/threads/how-to-appeal-a-ban.876/#post-3058";

var Command = require("../command");

module.exports = new Command("banappeal", {
    desc: "Command to create a ban appeal.",
    aliases: ["banappeals", "ban-appeal", "ban-appeals"]
}, (message) => {

    let thumb = message.guild.iconURL({dynamic: true});
    message.channel.embed({
        fields: [
            {
                name: "The Ban Appeal Format",
                value: `So you have been banned from the server. To appeal your ban, you must create a ban appeal on the Zhorde Forums, following the appropriate format. The ban appeal format can be found [here](${banFormat}).`
            },
            {
                name: "Properly Appealing",
                value: `Copy the template provided in the ban appeal format. Create a new appeal thread [here](${banThread}) and paste the template. Provide detailed and professional responses to the prompts provided in the template. Afterwards, wait patiently until staff reviews your appeal.`
            }
        ],
        title: "Ban Appeals",
        thumbnail: thumb
    });

});