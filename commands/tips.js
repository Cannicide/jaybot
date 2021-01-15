//The command to provide tips on gameplay and the server, mostly the same as those in-game

var Command = require("../command");
const evg = require("../evg").cache("tips");
var json_src = "https://cdn.discordapp.com/attachments/728320173009797190/728320370205261844/tips.json";

function getTips() {
    return evg.get();
}

function randomNumber(length) {
    return Math.floor(Math.random() * length);
}

var tipFunc = (message, args) => {

    //If args[0] present, send all tips to the player in JSON file format
    if (args && args[0] && args[0].toLowerCase() == "all") {
        //Send all tips
        message.channel.send({content: "All of the in-game tips: ", files:[{attachment: json_src, name: "tips.json"}]});
    }
    else {
        //Send random tip
        var tips = getTips();
        var tip = tips[randomNumber(tips.length)];

        message.channel.send(`**Random tip:** ${tip}`);
    }

};

module.exports = {
    commands: [new Command("tips", {
        desc: "View the in-game tips.",
        args: [
            {
                name: "all",
                optional: true
            }
        ],
        aliases: ["tip"]
    }, tipFunc)]
};