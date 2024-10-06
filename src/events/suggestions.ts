import { listener } from "@brynjolf/events";
import { setTimeout as wait } from "node:timers/promises";
import { ChannelType } from "discord.js";
import type { Message } from "discord.js";

// Utils

function infoEmbed() {
    const funSuggestion = [
        "Try to blame Cannicide and Zombie more",
        "Give everyone the #BlameZombie tag",
        "Avoid using #BlameJay anywhere",
        "I'm from planet minecraft give me op",
        "Remove all zombies from the game, they're too difficult"
    ][Math.floor(Math.random() * 5)];

    return {embeds: [{
        description: `
        ### Please use the format \`Suggestion: <your suggestion>\` to make suggestions.
        Example:
        \`\`\`fix\nSuggestion: ${funSuggestion}\n\`\`\`
        If you would like to discuss a suggestion, right click the message and create a thread.
        `.trim()
    }]};
}

// Events

class SuggestionsListener {
    @listener("messageCreate")
    async onSuggestionSent(message: Message) {
        if (!message.channel || message.channel.type != ChannelType.GuildText) return;
        if (!message.channel.name.match("suggestions") || message.author.bot) return;
        // If above conditions pass, a suggestion message has been created

        const isSuggestion = message.content?.toLowerCase()?.startsWith("suggestion:");

        try {
            if (isSuggestion) {
                await message.react("713053971757006950");
                await message.react("713053971211878452");
            }
            else {
                await message.delete();
                const info = await message.channel.send(infoEmbed());
                await wait(15000);
                info.delete();
            }
        }
        catch (err: any) {
            console.log("Error occurred during suggestion-voting: " + err.message);
        }
    }
}

new SuggestionsListener();