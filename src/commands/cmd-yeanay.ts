import { Command, Adapter, opts } from "@brynjolf/commands";
import { setTimeout as wait } from "node:timers/promises";

new Command("yeanay", "Admin-only command to add a yea-nay vote to a specified message.")
.args`<${opts.str({ name: "message", desc: "ID of message to add vote to." })}>`
.perms.members(["Administrator"])
.adapter(Adapter.DJS)
.execute(async i => {
    await i.deferReply({ ephemeral: true });

    const message = i.options.getString("message", true);
    const msg = await i.channel?.messages.fetch(message);
    if (msg == null) {
        await wait(1000);
        i.editReply("Failed to add a reaction vote; the message-ID may be invalid.");
        return;
    }

    await msg.react("713053971757006950");
    await msg.react("713053971211878452");

    await wait(1000);
    i.editReply("Successfully added a reaction vote to the message.");
});