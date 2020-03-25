var Command = require("./command");
//var Interface = require("./interface")

module.exports = new Command("help", (message, args) => {

    //Rudimentary help command for now, will be improved once all commands are added
    var cmds = new Command().getCommands();
    var res = "";
    var prefix = args[0];

    cmds.forEach((item) => {
        if (!item.special) {
            res += item.name + ": " + prefix + item.name;// + "\n";
            let params = item.cmd.getArguments();
            if (!params) {
                res += "\n";
            }
            else {
                params.forEach((arg) => {
                    if ("optional" in arg && arg.optional == true) {
                        res += ` [${arg.name}]`;
                    }
                    else {
                        res += ` <${arg.name}>`;
                    }
                });
                res += "\n";
            }
        }
    });

    message.channel.send(res);

}, false);