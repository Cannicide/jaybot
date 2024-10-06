import { Command, Adapter } from "@brynjolf/commands";

new Command("pluralkit", "Explains what Pluralkit does and who it is for.")
.adapter(Adapter.DJS)
.execute(i => {
    // Added by https://github.com/Kurumi78
    i.reply({
        ephemeral: false,
        content: ">>> Why PluralKit? Plurality is the existence of multiple self-aware entities inside the same brain. Each member of a system/collective (group residing inside the same physical brain) is an individual person, so please treat them as such. On Discord, some systems may use PluralKit to make their message appear with the correct profile, resulting in a [BOT] tag.\n-# Note: We do NOT tolerate the use of PluralKit for role playing."
    });
});