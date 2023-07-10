const { createEvent, db, wait, constants } = require("../panacea");

// Utils

const encodeReaction = (reaction) => {
    return Buffer.from(reaction, "ascii").toString("base64");
};

const refreshReactionRoleCache = async (client) => {
    console.log("Refreshing reaction role cache...");

    const cache = await db.rrReactions.keys();
    const guilds = constants.guilds;

    cache.forEach(async messageId => {
        //Fetch and cache all messages that need their reactions interpreted
        for (const guildId of guilds) { 
            const guild = await client.guilds.fetch(guildId);

            for (const [_, channel] of await guild.channels.fetch()) {
                // console.log("Viewing", channel?.name);
                try {
                    if (await channel?.messages?.fetch(messageId, true)) console.log("Successfully fetched reaction role message.");
                }
                catch {}
            }
        }
    });
};

// Reaction Role System methods

const isReactionRole = async (reactionId, messageId) => {
    const isReactionRoleMessage = await db.rrReactions.has(messageId);
    if (!isReactionRoleMessage) return false;

    const reactionRoles = await db.rrReactions.get(messageId);
    if (!reactionRoles?.includes(encodeReaction(reactionId))) return false;

    return true;
};

const getRoleFromName = (guild, roleName) => {
    return guild.roles.cache.find(rol => rol.name.toLowerCase() == roleName.toLowerCase());
};

const getReactionRole = async (r) => {
    const rank = await db.rrRoles.get(encodeReaction(r.emoji.id || r.emoji.name));
    return getRoleFromName(r.message.guild, rank);
};

const addReactionRole = async (messageId, reactionId, roleName) => {
    // Set messageId : reactionIds map
    const reactionRoles = await db.rrReactions.get(messageId) ?? [];
    reactionRoles.push(encodeReaction(reactionId));
    await db.rrReactions.set(messageId, reactionRoles);

    // Set reactionId : roleNames map
    await db.rrRoles.set(encodeReaction(reactionId), roleName);

    return { type: "add" };
};

const removeReactionRole = async (messageId, reactionId) => {
    // Set messageId : reactionIds map
    const reactionRoles = await db.rrReactions.get(messageId) ?? [];
    reactionRoles.splice(reactionRoles.indexOf(encodeReaction(reactionId)), 1);
    await db.rrReactions.set(messageId, reactionRoles);

    // Set reactionId : roleNames map
    await db.rrRoles.delete(encodeReaction(reactionId));

    // Remove above map if empty
    if (reactionRoles.length == 0) {
        await wait(200);
        await db.rrReactions.delete(messageId);
    }

    return { type: "remove" };
};

const toggleReactionRole = async (messageId, reactionId, roleName) => {
    if (await isReactionRole(reactionId, messageId)) return removeReactionRole(messageId, reactionId);
    else return addReactionRole(messageId, reactionId, roleName);
};

const getMember = async (r, u) => {
    return await r.message.guild.members.fetch(u.id);
}

createEvent({
    name: "messageReactionAdd",
    handler: async (r, u) => {
        if (u.bot) return false;

        if (!(await isReactionRole(r.emoji.id || r.emoji.name, r.message.id))) return;

        const role = await getReactionRole(r);
        const mem = await getMember(r, u);
        if (!role || !mem) return;

        try {
            await mem.roles.add(role, "Panacea Reaction Role System.");
        }
        catch {
            console.log("Adding reaction role failed.")
        }
    }
});

createEvent({
    name: "messageReactionRemove",
    handler: async (r, u) => {
        if (u.bot) return false;
        if (!(await isReactionRole(r.emoji.id || r.emoji.name, r.message.id))) return;

        const role = await getReactionRole(r);
        const mem = await getMember(r, u);
        if (!role || !mem) return;

        try {
            await mem.roles.remove(role, "Panacea Reaction Role System.");
        }
        catch {
            console.log("Removing reaction role failed.")
        }
    }
});

createEvent({
    name: "ready",
    handler: client => {
        refreshReactionRoleCache(client);
    }
});

module.exports = {
    isReactionRole,
    addReactionRole,
    removeReactionRole,
    toggleReactionRole,
    getReactionRole,
    getMember,
    getRoleFromName
}