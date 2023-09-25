const { createEvent, db, discordCard, sequelize, Discord } = require("../panacea");

const rankUtils = {
    generateXp() {
        // Generate number 15-25
        return Math.floor(Math.random() * (25 - 15 + 1)) + 15;
    },

    getXpTotalAtLevel(level) {
        // Apply derivation of Mee6 formula to get xp at level
        return Math.floor((5 * level / 6) * (2 * level + 13) * (level + 7));
    },

    getRemainingXpToLevelUp(currentXp, currentLevel) {
        // Get needed remaining xp to get to next level, based on current xp (used to check level up status)
        return rankUtils.getXpFromCurrentToNextLevel(currentLevel) - rankUtils.getXpProgressTowardsNextLevel(currentXp, currentLevel);
    },

    getXpFromCurrentToNextLevel(currentLevel) {
        // Get xp needed to get from level A to level A + 1 (used in rank card progress bar)
        return rankUtils.getXpTotalAtLevel(currentLevel + 1) - rankUtils.getXpTotalAtLevel(currentLevel);
    },

    getXpProgressTowardsNextLevel(currentXp, currentLevel) {
        // Get progress towards next level (used in rank card progress bar)
        return currentXp - rankUtils.getXpTotalAtLevel(currentLevel);
    },

    isLevelUp(newXp, currentXp, currentLevel) {
        // Check if xp exceeds needed xp
        const xpToNext = rankUtils.getRemainingXpToLevelUp(currentXp, currentLevel);
        return newXp >= xpToNext;
    },

    async setXp(userId, xp, level, messages, username, avatar) {
        // Set the exact xp and level of a user

        await db.PlayerRank.findOrCreate({
            where: { playerId: userId },
            defaults: {
                monthTimestamp: Date.now(),
                ...(username && { playerUsername: username }),
                ...(avatar && { playerAvatar: avatar })
            }
        });

        return await db.PlayerRank.update({
            xp,
            level,
            messages
        }, { where: { playerId: userId } });
    },

    async clearXp() {
        return await db.PlayerRank.destroy({
            truncate: true
        });
    },

    /**
     * @param {import("sequelize").Model} playerRank 
     * @param {Number} newXp
     * @param {boolean} isLevelUp
     */
    async updateXp(playerRank, newXp, isLevelUp, user, newMessages=1) {
        // Update xp and level

        return await db.PlayerRank.update({
            // @ts-ignore
            xp: playerRank.xp + newXp,
            // @ts-ignore
            level: isLevelUp ? playerRank.level + 1 : playerRank.level,
            playerUsername: rankUtils.getFancyUsername(user.username),
            playerAvatar: user?.displayAvatarURL(),
            customColor: rankUtils.isDarkColor(user?.accentColor) ? null : user.hexAccentColor,
            // @ts-ignore
            messages: playerRank.messages + newMessages
        // @ts-ignore
        }, { where: { playerId: playerRank.playerId } });
    },

    /**
     * @param {import("sequelize").Model} playerRank 
     * @param {Number} newXp
     * @param {boolean} isLevelUp
     */
    async updateXpMonthly(playerRank, newXp, isLevelUp) {
        // Update monthly xp, level, and month timestamp

        // @ts-ignore
        const prevMonth = new Date(+playerRank.monthTimestamp).getMonth();
        if (prevMonth != new Date().getMonth()) {
            const rank = await rankUtils.getRankMonthly();
            if (rank < 4) require("fs").writeFileSync(__dirname + "/../../storage/monthlyRankWinners.json", (() => {
                const lb = require("../../storage/monthlyRankWinners.json");
                lb[rank] = {
                    // @ts-ignore
                    id: playerRank.playerId,
                    // @ts-ignore
                    name: playerRank.playerUsername
                };
                return JSON.stringify(lb);
            })());

            // @ts-ignore
            playerRank.xpMonthly = 0;
            // @ts-ignore
            playerRank.levelMonthly = 0;
            // @ts-ignore
            playerRank.monthTimestamp = Date.now();
        }
        
        return await db.PlayerRank.update({
            // @ts-ignore
            xpMonthly: playerRank.xpMonthly + newXp,
            // @ts-ignore
            levelMonthly: isLevelUp ? playerRank.levelMonthly + 1 : playerRank.levelMonthly,
            // @ts-ignore
            monthTimestamp: playerRank.monthTimestamp
        // @ts-ignore
        }, { where: { playerId: playerRank.playerId } });
    },

    async removeUser(userId) {
        // Removes the provided user's rank data entirely

        return await db.PlayerRank.destroy({
            where: { playerId: userId }
        });
    },

    async getUser(userId) {
        // Gets the provided user's rank data

        return await db.PlayerRank.findOne({
            where: { playerId: userId }
        });
    },

    async getTop100(isMonthly=false) {
        // Gets the rank data for the top 100 users

        return await db.PlayerRank.findAll({ 
            limit: 100,
            order: [[isMonthly ? 'xpMonthly' : 'xp', 'DESC']]
        });
    },

    /**
     * @param {import("sequelize").Model} playerRank 
     */
    isInCooldown(playerRank) {
        // Check if on 1 minute message cooldown, true if on cooldown, false if no longer on cooldown
        const timestamp = Date.now();
        // @ts-ignore
        const lastTimestamp = playerRank.cooldown;

        if (timestamp - lastTimestamp < 60 * 1000) return true;
        return false;
    },

    /**
     * @param {import("sequelize").Model} playerRank 
     */
    async updateCooldown(playerRank) {
        const timestamp = Date.now();

        return await db.PlayerRank.update({
            cooldown: timestamp
        // @ts-ignore
        }, { where: { playerId: playerRank.playerId } })
    },

    isDarkColor(colorNum) {
        // Derived directly from https://stackoverflow.com/a/12043228/6901876

        if (!colorNum) return true;

        var r = (colorNum >> 16) & 0xff;  // extract red
        var g = (colorNum >>  8) & 0xff;  // extract green
        var b = (colorNum >>  0) & 0xff;  // extract blue

        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

        if (luma < 40) return true; 
        return false;
    },

    async getRank(playerRank) {
        const rank = await db.PlayerRank.count({
            where: {
                xp: {
                    [sequelize.Op.gt]: playerRank.xp
                },       
            }
        });
        return rank + 1;
    },

    async getRankMonthly(playerRank) {
        const rank = await db.PlayerRank.count({
            where: {
                xpMonthly: {
                    [sequelize.Op.gt]: playerRank.xpMonthly
                },       
            }
        });
        return rank + 1;
    },

    /**
     * @param {*} userId 
     * @param {*} currentXp 
     * @param {*} requiredXp 
     * @param {*} level 
     * @param {*} rank 
     * @param {*} customColor 
     * @param {*} status 
     * @returns 
     */
    async getRankCard(userId, currentXp, requiredXp, level, rank, customColor='#2ECC71', status='offline') {
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
                rank,
                level,
                barColor: customColor ?? '#2ECC71',
                levelColor: customColor ?? '#2ECC71',
                autoColorRank: true,
                brighterBar: true
            }
        });
    },

    getLeaderboards() {
        // Get leaderboards link for guild
        return `https://zh.cannicide.net/ranks`;
    },

    sendLevelUpMessage(player, currentLevel) {
        // Send DM with level up message
        player.send(`> 🎉 **Congratulations <@${player.id}>, you leveled up!**\n> \`LVL ${currentLevel} ➡ ${currentLevel + 1}\``).catch(() => {});
    },

    sendLeaderboardsMessage(interaction) {
        // Send message with button to leaderboards
        return interaction.reply({
            content: `> 🏆 **View the all-time and monthly Discord XP leaderboards!**`,
            components: [new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Link)
                .setURL(rankUtils.getLeaderboards())
                .setLabel("View leaderboards")
            )]
        });
    },

    async sendRankCard(interaction, playerRank, guildMember) {
        const currentXp = rankUtils.getXpProgressTowardsNextLevel(playerRank.xp, playerRank.level);
        const requiredXp = rankUtils.getXpFromCurrentToNextLevel(playerRank.level);
        const rank = await rankUtils.getRank(playerRank);

        const rankCard = await rankUtils.getRankCard(playerRank.playerId, currentXp, requiredXp, playerRank.level, rank, playerRank.customColor, guildMember.presence?.status);
        interaction.followUp({
            ...rankCard,
            content: "> ## 🏅 All-Time Rank"
        });
    },

    async sendRankCardMonthly(interaction, playerRank, guildMember) {
        const currentXp = rankUtils.getXpProgressTowardsNextLevel(playerRank.xpMonthly, playerRank.levelMonthly);
        const requiredXp = rankUtils.getXpFromCurrentToNextLevel(playerRank.levelMonthly);
        const rank = await rankUtils.getRankMonthly(playerRank);

        const rankCard = await rankUtils.getRankCard(playerRank.playerId, currentXp, requiredXp, playerRank.levelMonthly, rank, playerRank.customColor, guildMember.presence?.status);
        interaction.followUp({
            ...rankCard,
            content: "> ## 📅  Monthly Rank"
        });
    },

    getFancyUsername(name) {
        return name.slice(0, 1).toUpperCase() + name.slice(1);
    },

    async updateRank(user, messages=1, useCooldown=true) {
        const [ playerRank ] = await db.PlayerRank.findOrCreate({
            where: { playerId: user.id },
            defaults: {
                playerUsername: rankUtils.getFancyUsername(user.username),
                playerAvatar: user?.displayAvatarURL(),
                customColor: rankUtils.isDarkColor(user?.accentColor) ? null : user.hexAccentColor,
                monthTimestamp: Date.now()
            }
        });

        if (useCooldown && rankUtils.isInCooldown(playerRank)) return;

        const newXp = rankUtils.generateXp() * messages;
        // @ts-ignore
        const isLevelUp = rankUtils.isLevelUp(newXp, playerRank.xp, playerRank.level);
        // @ts-ignore
        const isLevelUpMonthly = rankUtils.isLevelUp(newXp, playerRank.xpMonthly, playerRank.levelMonthly);
        
        // @ts-ignore
        if (isLevelUp) rankUtils.sendLevelUpMessage(user, playerRank.level);

        await rankUtils.updateCooldown(playerRank);

        await rankUtils.updateXp(playerRank, newXp, isLevelUp, user, messages);
        await rankUtils.updateXpMonthly(playerRank, newXp, isLevelUpMonthly);
    },
}

createEvent({
    name: "messageCreate",
    handler: async (message) => {
        if (!message.author || message.author.bot || !message.guild || message.system) return;
        const user = await message.author.fetch({ force: true });
        
        await rankUtils.updateRank(user);
    }
});

module.exports = rankUtils;