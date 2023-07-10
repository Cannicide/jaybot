const { PermissionFlagsBits } = require("discord.js");
const { db, mcstats, Discord, createEvent, constants } = require("../panacea");

const statsMins = 6;
const guildId = constants.mainGuild;

const statUtils = {
    channelPerms: [
        {
            //@everyone
            id: guildId,
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            allow: [PermissionFlagsBits.ViewChannel]
        }
    ],

    onlineDisplay(data, category) {
        return {
            // @ts-ignore
            name: data.online ? `🟢 ZombieHorde.net` : `🔴 ZombieHorde.net`,
            parent: category,
            permissionOverwrites: statUtils.channelPerms,
            type: Discord.ChannelType.GuildVoice,
            reason: "[Panacea Stats]"
        };
    },

    playerDisplay(data, category) {
        return {
            // @ts-ignore
            name: `Players: ${data.players ?? 0}/${data.maxPlayers ?? 0}`,
            parent: category,
            permissionOverwrites: statUtils.channelPerms,
            type: Discord.ChannelType.GuildVoice,
            reason: "[Panacea Stats]"
        };
    }
};

const statsSave = async (client) => {
      
    const utc = Date.now();
    const guild = client.guilds.cache.find(g => g.id == guildId);

    // Fetch stats and save:

    const stats = await mcstats();
    if (stats) {
        db.ServerStat.create({
            timestamp: utc,
            online: stats.online,
            players: stats.players?.online ?? 0,
            maxPlayers: guild?.memberCount ?? 0
        });
    }

}

let previousData = null;
const statsDisplay = async (client, initial=false) => {

    const guild = client.guilds.cache.find(g => g.id == guildId);
    // @ts-ignore
    const categoryId = (await db.StatCategory.findOne())?.categoryId;

    if (!categoryId || !guild) return console.log("Unable to find category (", categoryId, ") or guild (", guild?.id, ")");
    const category = await guild.channels.fetch(categoryId);
    if (!category) return;

    const largestTimestamp = await db.ServerStat.max("timestamp");
    const data = await db.ServerStat.findOne({ where: { timestamp: largestTimestamp } });

    // @ts-ignore
    if (data && data.timestamp != previousData?.timestamp) {
        // This statistics method bypasses channel-renaming rate limits and avoids random Discord API channel dupe glitches

        previousData = data;

        if (initial) {
            // Remove all channels in category
            category.children.cache.each(channel => channel.delete("[Statistics]"));

            // Add channel for online status
            await guild.channels.create(statUtils.onlineDisplay(data, category));

            // Add channel for player count
            await guild.channels.create(statUtils.playerDisplay(data, category));
        }
        else {
            category.children.cache.first().edit(statUtils.onlineDisplay(data, category));
            category.children.cache.last().edit(statUtils.playerDisplay(data, category));
        }

    }
}

createEvent({
    name: "ready",
    handler: (client) => {
        setInterval(() => statsSave(client), statsMins * 60 * 1000);
        setTimeout(() => setInterval(() => statsDisplay(client), statsMins * 60 * 1000), 2000);
    }
});

module.exports = {
    statsDisplay,
    statsSave
};