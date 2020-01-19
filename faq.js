var Command = require("./command");

module.exports = new Command((message, args) => {

    message.channel.send("Test this command (FAQ) with arguments: " + args.join(", "));

}, false);