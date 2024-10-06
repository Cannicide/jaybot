import { reactionRolesDB, ReactionRole } from "../systems/database.js";
import { listener } from "@brynjolf/events";
import { isReactionRole, getReactionRole } from "../systems/reactionroles.js";
import { GUILDS } from "../systems/constants.js";
import type { Client, User, MessageReaction } from "discord.js";

// Utils

async function getMember(reaction: MessageReaction, user: User) {
    return await reaction.message.guild?.members.fetch(user.id);
}

async function refreshReactionRoleCache(client: Client) {
    console.log("Refreshing reaction role cache...");

    const cache = await reactionRolesDB.find();
    const messages: Set<string> = new Set();

    while (await cache.hasNext()) {
        const { messageId } = await cache.next() as ReactionRole;
        messages.add(messageId);
    }

    //Fetch and cache all messages that need their reactions interpreted
    for (const guildId of GUILDS) { 
        const guild = await client.guilds.fetch(guildId);
        for (const [_, channel] of await guild.channels.fetch()) {
            if (channel && "messages" in channel) {
                for (const messageId of messages) {
                    try {
                        if (await channel.messages.fetch({
                            message: messageId,
                            force: true
                        })) console.log("Successfully fetched reaction role message.");
                    } catch {}
                }
            }
        }
    }
}

// Reaction role events

class ReactionRolesListener {

    @listener("messageReactionAdd")
    async onReactionAdd(reaction: MessageReaction, user: User) {
        if (user.bot || !reaction.message.guild) return false;

        if (!(await isReactionRole(reaction.emoji.id ?? reaction.emoji.name!, reaction.message.id))) return;

        const role = await getReactionRole(reaction);
        const mem = await getMember(reaction, user);
        if (!role || !mem) return;

        try {
            await mem.roles.add(role, "Jaybot Reaction Role System.");
        }
        catch {
            console.log("Adding reaction role failed.")
        }
    }

    @listener("messageReactionRemove")
    async onReactionRemove(reaction: MessageReaction, user: User) {
        if (user.bot || !reaction.message.guild) return false;
        if (!(await isReactionRole(reaction.emoji.id ?? reaction.emoji.name!, reaction.message.id))) return;

        const role = await getReactionRole(reaction);
        const mem = await getMember(reaction, user);
        if (!role || !mem) return;

        try {
            await mem.roles.remove(role, "Jaybot Reaction Role System.");
        }
        catch {
            console.log("Removing reaction role failed.")
        }
    }

    @listener("ready")
    onStart(client: Client) {
        refreshReactionRoleCache(client);
    }
}

new ReactionRolesListener();