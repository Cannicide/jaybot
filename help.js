var Command = require("./command");
//var Interface = require("./interface")

module.exports = new Command("help", (message, args) => {

    //Rudimentary help command for now, will be improved once all commands are added
    var cmds = new Command().getCommands();
    var res = "";
    var prefix = args[0];

    cmds.forEach((item) => {
        res += item.name + ": " + prefix + item.name + "\n";
    });

    message.channel.send(res);

}, false);