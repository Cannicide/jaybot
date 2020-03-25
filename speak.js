//Designed to be a fun test of the command permissions and argument attachment systems.

var Command = require("./command");
var Interface = require("./interface");
var googleTTS = require("google-tts-api");

module.exports = new Command("speak", (message, args) => {

    var voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
        message.reply(`you need to be in a voice channel first!`);
    }
    else {
        let textToSpeak = new Interface.Interface(message, "What text would you like to convert to speech? (<= 200 Characters).", (answer, menu) => {
            if (!answer) {}
            else {
                menu.edit("Conveying your TTS message through the bot...");
                if (answer.content.length > 200) {
                    message.channel.send("Failed to speak text: your text was above the 200 character limit.");
                }
                else {
                    googleTTS(answer.content + `                  Z`, args[0] ? args[0] : "en-US", 1)   // speed normal = 1 (default), slow = 0.24
                    .then(function (url) {
                        voiceChannel.join().then(connection => {
                            message.channel.send("Playing TTS audio... ");
                            var dispatcher = connection.playArbitraryInput(url);
                            dispatcher.on("speaking", value => {
                                setTimeout(() => {
                                    if (!value) {
                                        message.channel.send(`Left voice channel, ${message.author.username}.`);
                                        voiceChannel.leave();
                                    }
                                }, 10000);
                            });
                        }).catch(err => {
                            console.log(`Unable to join/play in Voice Channel. The following error occurred:\n\`\`\`\n${err.stack}\n\`\`\``);
                        });
                    })
                    .catch(function (err) {
                        console.log(`Unable to speak text. The following error occurred:\n\`\`\`\n${err.stack}\n\`\`\``);
                    });
                }
            }
        })
    }

}, ["ADMINISTRATOR"], true).attachArguments([
    {
        name: "language-accent",
        optional: true
    }
]);