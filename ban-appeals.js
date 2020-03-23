//A command to allow players to appeal their bans, showing them the proper way of doing so
/*Ban appeal creation:*/ const banThread = "https://zhorde.net/forums/ban-appeals.17/create-thread?title=_%27s+Ban+Appeal"
/*Ban appeal format:*/ const banFormat = "https://zhorde.net/threads/how-to-appeal-a-ban.876/#post-3058";

var Command = require("./command");
var Interface = require("./interface");

module.exports = new Command("banappeal", (message, args) => {

    let thumb = "https://cdn.discordapp.com/attachments/372124612647059476/431626525809573898/ZHFinal.png";
    var embed = new Interface.Embed(message, thumb, [
        {
            name: "The Ban Appeal Format",
            value: `So you have been banned from the server. To appeal your ban, you must create a ban appeal on the Zhorde Forums, following the appropriate format. The ban appeal format can be found [here](${banFormat}).`
        },
        {
            name: "Properly Appealing",
            value: `Once you have read the ban appeal format, copy the template provided in it. Create a new ban appeal thread [here](${banThread}). In order to maximize your chances of getting unbanned, provide detailed and professional responses to the prompts provided in the template. After you are finished creating your ban appeal, wait patiently until a staff member reviews your appeal. You will see a reply to your appeal on the forums either accepting or denying your appeal, and an explanation if denied. Please also refrain from nagging staff members to read your appeal. Doing so may increase the length of your ban, or may decrease your chances of getting unbanned.`
        }
    ]);

    message.channel.send(embed);

}, false);