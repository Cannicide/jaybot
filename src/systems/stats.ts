import { GUILDS } from "./constants.js";
import { statCategoryDB, StatCategory, statUptimeDB, StatUptime } from "./database.js";
import miniget from "miniget";
import { PermissionFlagsBits, ChannelType } from "discord.js";
import type { CategoryChannel, Client, GuildChannelCreateOptions, GuildChannelEditOptions } from "discord.js";

// Utils

const guildId = GUILDS[0];

const statUtils = {
    channelPerms: [
        {
            //@everyone
            id: guildId,
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            allow: [PermissionFlagsBits.ViewChannel]
        }
    ],

    onlineDisplay(data: StatUptime, category: CategoryChannel) {
        return {
            name: data.online ? `🟢 ZombieHorde.net` : `🔴 ZombieHorde.net`,
            parent: category,
            permissionOverwrites: statUtils.channelPerms,
            type: ChannelType.GuildVoice,
            reason: "[Jaybot Stats]"
        };
    },

    playerDisplay(data: StatUptime, category: CategoryChannel) {
        return {
            name: `Players: ${data.players ?? 0}/${data.maxPlayers ?? 0}`,
            parent: category,
            permissionOverwrites: statUtils.channelPerms,
            type: ChannelType.GuildVoice,
            reason: "[Jaybot Stats]"
        };
    }
};

async function mcstats() {
    const stats = JSON.parse(await miniget("https://api.mcstatus.io/v2/status/java/zombiehorde.net?query=false").text());
    return stats;
}

// Methods

export async function statsSave(client: Client) {
    const utc = new Date();
    const guild = client.guilds.cache.find(g => g.id == guildId);

    // Fetch stats and save:
    const stats = await mcstats();
    if (stats)
        await statUptimeDB.insertOne({
            timestamp: utc,
            online: stats.online,
            players: stats.players?.online ?? 0,
            maxPlayers: guild?.memberCount ?? 0
        });
}

let previousData: StatUptime|null = null;
export async function statsDisplay(client: Client, initial=false) {
    const guild = client.guilds.cache.find(g => g.id == guildId);
    const categoryId = (await statCategoryDB.findOne() as StatCategory)?.categoryId;

    if (!categoryId || !guild) return console.log("Unable to find category (", categoryId, ") or guild (", guild?.id, ")");
    const category = await guild.channels.fetch(categoryId) as CategoryChannel;
    if (!category) return;

    const data = await statUptimeDB.findOne({}, { sort: { "_id": -1 }, limit: 1 }) as StatUptime;

    // @ts-ignore
    if (data && data.timestamp != previousData?.timestamp) {
        // This statistics method bypasses channel-renaming rate limits and avoids random Discord API channel dupe glitches

        previousData = data;

        if (initial) {
            // Remove all channels in category
            category.children.cache.each(channel => channel.delete("[Statistics]"));

            // Add channel for online status
            await guild.channels.create(statUtils.onlineDisplay(data, category) as GuildChannelCreateOptions);

            // Add channel for player count
            await guild.channels.create(statUtils.playerDisplay(data, category) as GuildChannelCreateOptions);
        }
        else {
            category.children.cache.first()?.edit(statUtils.onlineDisplay(data, category) as GuildChannelEditOptions);
            category.children.cache.last()?.edit(statUtils.playerDisplay(data, category) as GuildChannelEditOptions);
        }

    }
}