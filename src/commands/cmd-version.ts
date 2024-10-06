import { Command, Adapter } from "@brynjolf/commands";

new Command("version", "Returns the current version of Jaybot.")
.adapter(Adapter.DJS)
.execute(i => {
    i.reply({
        ephemeral: true,
        content: "> ### Jaybot v5.0.0"
    });
});