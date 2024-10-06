import { reactionRolesDB, ReactionRole } from "./database.js";
import type { Guild, MessageReaction } from "discord.js";

// Utils

function encodeReaction(reactionId: string) {
    return Buffer.from(reactionId, "ascii").toString("base64");
}

function getRoleFromName(guild: Guild, roleName: string) {
    return guild.roles.cache.find(rol => rol.name.toLowerCase() == roleName.toLowerCase());
}

async function addReactionRole(messageId: string, reactionId: string, roleName: string) {
    await reactionRolesDB.insertOne({ messageId, reactionId: encodeReaction(reactionId), roleName });
    return { type: "add" };
}

async function removeReactionRole(messageId: string, reactionId: string) {
    await reactionRolesDB.deleteMany({ messageId, reactionId: encodeReaction(reactionId) });
    return { type: "remove" };
}

// Reaction Role System methods

export async function isReactionRole(reactionId: string, messageId: string) {
    const isReactionRoleMessage = await reactionRolesDB.findOne({ messageId });
    if (!isReactionRoleMessage) return false;

    const reactionRoles = await reactionRolesDB.findOne({ messageId, reactionId: encodeReaction(reactionId) });
    return !!reactionRoles;
}

export async function getReactionRole(reaction: MessageReaction) {
    const reactionRole = await reactionRolesDB.findOne({ reactionId: encodeReaction(reaction.emoji.id ?? reaction.emoji.name!) }) as ReactionRole;
    return getRoleFromName(reaction.message.guild!, reactionRole.roleName);
}

export async function toggleReactionRole(messageId: string, reactionId: string, roleName: string) {
    if (await isReactionRole(reactionId, messageId)) return removeReactionRole(messageId, reactionId);
    else return addReactionRole(messageId, reactionId, roleName);
}