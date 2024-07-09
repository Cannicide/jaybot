const Vidar = require("djs-vidar");

Vidar.command("version", "Returns the current version of Panacea.")
.action(async i => {
    i.reply({
        ephemeral: true,
        content: "> ### Panacea v4.0.1"
    });
});
