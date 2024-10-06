import { profileImage as discordCard } from "discord-arts-zhorde";
import { playerRanksDB, playerRankWinnersDB, PlayerRank, PlayerRankWinner } from "./database.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { APIActionRowComponent, APIButtonComponent, CommandInteraction, GuildMember, User } from "discord.js";
import type { PresenceStatus } from "discord.js";

// Utils

function isDarkColor(colorNum: number|null|undefined) {
    // Derived directly from https://stackoverflow.com/a/12043228/6901876

    if (!colorNum) return true;

    var r = (colorNum >> 16) & 0xff;  // extract red
    var g = (colorNum >>  8) & 0xff;  // extract green
    var b = (colorNum >>  0) & 0xff;  // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma < 40) return true; 
    return false;
}

function getLeaderboards() {
    // Get leaderboards link for guild
    return `https://zh.cannicide.net/ranks`;
}

function getFancyUsername(name: string) {
    return name.slice(0, 1).toUpperCase() + name.slice(1);
}

// System

export function generateXp() {
    // Generate number 15-25
    return Math.floor(Math.random() * (25 - 15 + 1)) + 15;
}

export function getXpTotalAtLevel(level: number) {
    // Apply derivation of Mee6 formula to get xp at level
    return Math.floor((5 * level / 6) * (2 * level + 13) * (level + 7));
}

export function getRemainingXpToLevelUp(currentXp: number, currentLevel: number) {
    // Get needed remaining xp to get to next level, based on current xp (used to check level up status)
    return getXpFromCurrentToNextLevel(currentLevel) - getXpProgressTowardsNextLevel(currentXp, currentLevel);
}

export function getXpFromCurrentToNextLevel(currentLevel: number) {
    // Get xp needed to get from level A to level A + 1 (used in rank card progress bar)
    return getXpTotalAtLevel(currentLevel + 1) - getXpTotalAtLevel(currentLevel);
}

export function getXpProgressTowardsNextLevel(currentXp: number, currentLevel: number) {
    // Get progress towards next level (used in rank card progress bar)
    return currentXp - getXpTotalAtLevel(currentLevel);
}

export function isLevelUp(newXp: number, currentXp: number, currentLevel: number) {
    // Check if xp exceeds needed xp
    const xpToNext = getRemainingXpToLevelUp(currentXp, currentLevel);
    return newXp >= xpToNext;
}

export async function setXp(userId: string, xp: number, level: number, messages: number, username: string, avatar: string) {
    // Set the exact xp and level of a user

    let rank = await playerRanksDB.findOne({
        playerId: userId
    });
    if (!rank) {
        await playerRanksDB.insertOne({
            playerId: userId,
            monthTimestamp: Date.now(),
            ...(username && { playerUsername: username }),
            ...(avatar && { playerAvatar: avatar })
        });
        rank = await playerRanksDB.findOne({
            playerId: userId
        });
    }

    return await playerRanksDB.updateOne({
        playerId: userId
    }, {
        $set: {
            xp,
            level,
            messages
        }
    });
}

export async function clearXp() {
    return await playerRanksDB.deleteMany({});
}

export async function updateXp(playerRank: PlayerRank, newXp: number, isLevelUp: boolean, user: User, newMessages=1) {
    // Update xp and level

    return await playerRanksDB.updateOne({
        playerId: playerRank.playerId
    }, {
        $set: {
            xp: playerRank.xp + newXp,
            level: isLevelUp ? playerRank.level + 1 : playerRank.level,
            playerUsername: getFancyUsername(user.username),
            playerAvatar: user?.displayAvatarURL(),
            customColor: isDarkColor(user?.accentColor) ? null : user.hexAccentColor,
            messages: playerRank.messages + newMessages
        }
    });
}

export async function updateXpMonthly(playerRank: PlayerRank, newXp: number, isLevelUp: boolean) {
    // Update monthly xp, level, and month timestamp

    // @ts-ignore
    const prevMonth = new Date(+playerRank.monthTimestamp).getMonth();
    if (prevMonth != new Date().getMonth()) {
        // Post to monthly winners database
        const existentWinners = await playerRankWinnersDB.findOne({
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        });
        if (!existentWinners) {
            const top100 = await getTop100(true);
            await playerRankWinnersDB.insertOne({
                firstUsername: top100[0],
                secondUsername: top100[1],
                thirdUsername: top100[2],
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            });
        }

        playerRank.xpMonthly = 0;
        playerRank.levelMonthly = 0;
        playerRank.monthTimestamp = Date.now();
    }
    
    return await playerRanksDB.updateOne({
        playerId: playerRank.playerId
    }, {
        $set: {
            xpMonthly: playerRank.xpMonthly + newXp,
            levelMonthly: isLevelUp ? playerRank.levelMonthly + 1 : playerRank.levelMonthly,
            monthTimestamp: playerRank.monthTimestamp
        }
    });
}

export async function removeUser(userId: string) {
    // Removes the provided user's rank data entirely

    return await playerRanksDB.deleteMany({
        playerId: userId
    });
}

export async function getUser(userId: string) {
    // Gets the provided user's rank data

    return await playerRanksDB.findOne({
        playerId: userId
    }) as PlayerRank;
}

export async function getTop100(isMonthly=false) {
    // Gets the rank data for the top 100 users

    return await playerRanksDB.aggregate([
        { $sort: { [isMonthly ? "xpMonthly" : "xp"]: -1 } },
        { $limit: 100 }
    ]).toArray();
}

export function isInCooldown(playerRank: PlayerRank) {
    // Check if on 1 minute message cooldown, true if on cooldown, false if no longer on cooldown
    const timestamp = Date.now();
    const lastTimestamp = playerRank.cooldown;

    if (timestamp - lastTimestamp < 60 * 1000) return true;
    return false;
}

export async function updateCooldown(playerRank: PlayerRank) {
    const timestamp = Date.now();

    return await playerRanksDB.updateOne({
        playerId: playerRank.playerId
    }, {
        $set: {
            cooldown: timestamp
        }
    });
}

export async function getRank(playerRank: PlayerRank) {
    const rank = await playerRanksDB.countDocuments({
        xp: { $gt: playerRank.xp }
    });
    return rank + 1;
}

export async function getRankMonthly(playerRank: PlayerRank) {
    const rank = await playerRanksDB.countDocuments({
        xpMonthly: { $gt: playerRank.xpMonthly }
    });
    return rank + 1;
}

export async function getRankCard(userId: string, currentXp: number, requiredXp: number, level: number, rankNumber: number, customColor='#2ECC71', status:PresenceStatus='offline') {
    // Get rank card image for player

    return discordCard(userId, {
        borderColor: customColor ?? '#121212', // TODO: fix null reading length error here in discord-arts-zhorde
        presenceStatus: status ?? 'offline',
        badgesFrame: true,
        moreBackgroundBlur: true,
        backgroundBrightness: 70,
        customDate: new Date(),
        rankData: {
            currentXp,
            requiredXp,
            rank: rankNumber,
            level,
            barColor: customColor ?? '#2ECC71',
            levelColor: customColor ?? '#2ECC71',
            autoColorRank: true,
            brighterBar: true
        }
    });
}

export function sendLevelUpMessage(player: User, currentLevel: number) {
    // Send DM with level up message
    player.send(`> 🎉 **Congratulations <@${player.id}>, you leveled up!**\n> \`LVL ${currentLevel} ➡ ${currentLevel + 1}\``).catch(() => {});
}

export function sendLeaderboardsMessage(interaction: CommandInteraction) {
    // Send message with button to leaderboards
    return interaction.reply({
        content: `> 🏆 **View the all-time and monthly Discord XP leaderboards!**`,
        components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(getLeaderboards())
            .setLabel("View leaderboards")
        ).toJSON() as APIActionRowComponent<APIButtonComponent>]
    });
}

export async function sendRankCard(interaction: CommandInteraction, playerRank: PlayerRank, guildMember: GuildMember) {
    const currentXp = getXpProgressTowardsNextLevel(playerRank.xp, playerRank.level);
    const requiredXp = getXpFromCurrentToNextLevel(playerRank.level);
    const rank = await getRank(playerRank);

    const rankCard = await getRankCard(playerRank.playerId, currentXp, requiredXp, playerRank.level, rank, playerRank.customColor, guildMember.presence?.status);
    interaction.followUp({
        ...rankCard,
        content: "> ## 🏅 All-Time Rank"
    });
}

export async function sendRankCardMonthly(interaction: CommandInteraction, playerRank: PlayerRank, guildMember: GuildMember) {
    const currentXp = getXpProgressTowardsNextLevel(playerRank.xpMonthly, playerRank.levelMonthly);
    const requiredXp = getXpFromCurrentToNextLevel(playerRank.levelMonthly);
    const rank = await getRankMonthly(playerRank);

    const rankCard = await getRankCard(playerRank.playerId, currentXp, requiredXp, playerRank.levelMonthly, rank, playerRank.customColor, guildMember.presence?.status);
    interaction.followUp({
        ...rankCard,
        content: "> ## 📅  Monthly Rank"
    });
}

export async function updateRank(user: User, messages=1, useCooldown=true) {
    let playerRank = await playerRanksDB.findOne({
        playerId: user.id
    }) as PlayerRank|null;
    if (!playerRank) {
        await playerRanksDB.insertOne({
            playerId: user.id,
            playerUsername: getFancyUsername(user.username),
            playerAvatar: user?.displayAvatarURL(),
            customColor: isDarkColor(user?.accentColor) ? null : user.hexAccentColor,
            monthTimestamp: Date.now()
        });
        playerRank = await playerRanksDB.findOne({
            playerId: user.id
        }) as PlayerRank;
    }

    if (useCooldown && isInCooldown(playerRank)) return;

    const newXp = generateXp() * messages;
    const isLevelUpData = isLevelUp(newXp, playerRank.xp, playerRank.level);
    const isLevelUpMonthlyData = isLevelUp(newXp, playerRank.xpMonthly, playerRank.levelMonthly);
    
    if (isLevelUpData) sendLevelUpMessage(user, playerRank.level);

    await updateCooldown(playerRank);

    await updateXp(playerRank, newXp, isLevelUpData, user, messages);
    await updateXpMonthly(playerRank, newXp, isLevelUpMonthlyData);
}