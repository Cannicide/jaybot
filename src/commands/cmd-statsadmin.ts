import { Command, opts, Adapter } from "@brynjolf/commands";
import { statsSave, statsDisplay } from "../systems/stats.js";
import { statCategoryDB } from "../systems/database.js";
import { setTimeout as wait } from "node:timers/promises";
import { CategoryChannel } from "discord.js";

new Command("statsadmin", "Admin command to set a category to display statistics in.")
.args`<${opts.chnl({ name: "category", desc: "Category to display in.", channelTypes: ["GuildCategory"] })}>`
.adapter(Adapter.DJS)
.execute(async i => {
    await i.deferReply({ ephemeral: true });
    const category = i.options.getChannel("category", true) as CategoryChannel;

    try {
        await statsSave(i.client);
        await statCategoryDB.deleteMany({
            isDestroyable: true
        });

        await wait(1000);
        await statCategoryDB.insertOne({ categoryId: category.id });

        await statsDisplay(i.client, true);
        i.editReply("Successfully added statistics to the provided category channel.");
    }
    catch (err: any) {
        await wait(1000);
        i.editReply(`Failed to add statistics to the provided category channel; an error occurred: ${err.message}.`);
    }
});