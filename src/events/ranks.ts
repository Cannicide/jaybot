import { listener } from "@brynjolf/events";
import { updateRank } from "../systems/ranks.js";
import type { Message } from "discord.js";

class RankListener {
    @listener("messageCreate")
    async onMessageSent(message: Message) {
        if (!message.author || message.author.bot || !message.guild || message.system) return;
        const user = await message.author.fetch(true);
        await updateRank(user);
    }
}

new RankListener();