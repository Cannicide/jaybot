const Vidar = require("djs-vidar");

Vidar.command("pluralkit", "Explains what Pluralkit does and who it is for.")
.action(async i => {
    i.reply({
        ephemeral: false,
        content: ">>> Why PluralKit? Plurality is the existence of multiple self-aware entities inside the same brain. Each member of a system/collective (group residing inside the same physical brain) is an individual person, so please treat them as such. On Discord, some systems may use PluralKit to make their message appear with the correct profile, resulting in a [BOT] tag. Note: We do NOT tolerate the use of PluralKit for role playing."
    });
});
