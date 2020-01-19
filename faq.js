var Command = require("./command");

module.exports = new Command((message, args) => {

    message.channel.send("Test this command (FAQ) with argument: " + args[0]);

}, false);