import { Command, opts, Adapter } from "@brynjolf/commands";
import { toggleReactionRole } from "../systems/reactionroles.js";
import { setTimeout as wait } from "node:timers/promises";
import { parseEmoji } from "discord.js";
import type { EmojiIdentifierResolvable } from "discord.js";

const message_id = opts.str({ name: "message_id", desc: "ID of message." });
const emoji = opts.str({ name: "emoji", desc: "Emoji of reaction." });
const role = opts.role({ name: "role", desc: "Role to add on reaction." });

new Command("reactionroles", "Admin-only command to toggle a reaction role on a message.")
.args`<${message_id}> <${emoji}> <${role}>`
.adapter(Adapter.DJS)
.execute(async i => {
    if (!i.channel) return;

    await i.deferReply({ ephemeral: true });
    const messageId = i.options.getString("message_id", true);
    const emojiId = i.options.getString("emoji", true);
    const roleData = i.options.getRole("role", true);

    let matchedEmoji = emojiId.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}|\d{18}/gu);
    if (!matchedEmoji) return i.editReply("Failed to add a reaction role; invalid emoji provided.");

    const reaction = parseEmoji((Array.isArray(matchedEmoji) ? matchedEmoji[0] : matchedEmoji).trim());
    if (!reaction) return i.editReply("Failed to add a reaction role; failed to parse emoji.");

    if (!roleData) return i.editReply("Failed to add a reaction role; invalid/non-existent role name provided.");
    let messageFetched = false;

    try {
        const msg = await i.channel.messages.fetch(messageId);
        messageFetched = true;

        const output = await toggleReactionRole(messageId, reaction.id || reaction.name, roleData.name);
        if (output.type == "add") {
            await msg.react(reaction as EmojiIdentifierResolvable);
            await wait(1000);
            i.editReply("Successfully added a reaction role.");
        }
        else {
            await msg.reactions.resolve(reaction.id ?? reaction.name)?.remove();
            await wait(1000);
            i.editReply("Successfully removed a reaction role.");
        }
    }
    catch (err: any) {
        await wait(3000);
        if (!messageFetched) i.editReply("Failed to add a reaction role; invalid message ID provided.");
        else i.editReply("An error occurred while toggling a reaction role: " + err.stack);
    }
});