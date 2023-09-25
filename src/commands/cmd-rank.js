const Vidar = require("djs-vidar");
const { sendRankCard, sendRankCardMonthly, sendLeaderboardsMessage, removeUser, getUser, setXp, clearXp, updateRank: simulateMessages } = require("../systems/ranks");

const rankCommand = async (i) => {
    await i.deferReply();

    const { user } = Vidar.args(i);

    const playerRank = await getUser(user ?? i.user.id);
    // @ts-ignore
    if (!playerRank || !playerRank.playerId) return await i.editReply(`> <:no:669928674119778304> **${user ? "The provided user does" : "You do"} not have a rank yet.**`);

    let member;
    try {
        member = user ? await i.guild.members.fetch(user) : i.member;
    }
    catch {
        member = user;
    }

    if (!member) return await i.editReply(`> <:no:669928674119778304> **Failed to find the provided user. Are they still in the guild?**`);

    if (i.commandName == "rankmonthly") {
        // Retrieve monthly rank card

        await sendRankCardMonthly(i, playerRank, member);
    }
    else {
        // Retrieve all-time rank card

        await sendRankCard(i, playerRank, member);
    }
};

const docs = {
    "rank": {
        "user": "OPTIONAL user to view rank of."
    },
    "rankmonthly": {
        "user": "OPTIONAL user to view rank of."
    },
    "rankadmin": {
        "remove": "Admin-only command to remove a user rank.",
        "import": "Admin-only command to import a user rank.",
        "clear": "Admin-only command to clear rank data.",
        "importmee6": "Admin-only command to import Mee6 data.",
        "simulate": "Admin-only command to simulate xp gain."
    }
};

Vidar.command("rank", "View your Discord message XP rank.")
.argument("[user: user]")
.docs(docs)
.action(rankCommand);

Vidar.command("rankmonthly", "View your Discord message XP monthly rank.")
.argument("[user: user]")
.docs(docs)
.action(rankCommand);

Vidar.command("rankadmin", "Command to manage ranks.")
.argument("remove <user: user>")
.argument("import <user: user> <xp: int> <level: int>")
.argument("clear")
.argument("importmee6")
.argument("simulate <messages: int>")
.require("Administrator")
.docs(docs)
.action({
    "remove": async (i) => {
        if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin remove` command.**", ephemeral: true });
        await i.deferReply({ ephemeral: true });

        const { user } = Vidar.args(i);
        if (user) await removeUser(user);
        else return await i.editReply("> <:no:669928674119778304> **Failed to retrieve the provided user.**");

        await i.editReply(`> ✅ **Successfully removed rank of user:** ${user}`);
    },
    "import": async (i) => {
        if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin import` command.**", ephemeral: true });
        await i.deferReply({ ephemeral: true });

        const { user, xp, level } = Vidar.args(i);
        if (user) await setXp(user, xp, level);
        else return await i.editReply("> <:no:669928674119778304> **Failed to retrieve the provided user.**");

        await i.editReply(`> ✅ **Successfully imported rank of user:** ${user}`);
    },
    "clear": async (i) => {
        if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin clear` command.**", ephemeral: true });
        await i.deferReply({ ephemeral: true });

        await clearXp();
        
        await i.editReply(`> ✅ **Successfully cleared rank data.**`);
    },
    "importmee6": async (i) => {
        if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin importmee6` command.**", ephemeral: true });
        const oldRanksRaw = require("../../storage/oldRanks.json");
        await i.deferReply();

        let oldRanks = oldRanksRaw.map(rank => {
            const id = rank.avatar.match(/(?<=cdn\.discordapp\.com\/avatars\/)[0-9]{18}/g)?.[0];
            if (!id) return;

            let xp;
            if (rank.xp.match("k")) xp = Number(rank.xp.slice(0, -1)) * 1000;
            else xp = Number(rank.xp);

            let messages;
            if (rank.messages.match("k")) messages = Number(rank.messages.slice(0, -1)) * 1000;
            else messages = Number(rank.messages);

            return {
                playerId: id,
                playerUsername: rank.username,
                playerAvatar: rank.avatar,
                xp,
                level: rank.level,
                messages
            };
        }).filter((v,i,a)=> v && a.findIndex(v2=>(v2?.playerId===v.playerId))===i);

        for (const rank of oldRanks) {
            await setXp(rank.playerId, rank.xp, rank.level, rank.messages, rank.playerUsername, rank.playerAvatar);
        }

        await i.editReply(`> ✅ **Successfully imported ${oldRanks.length} user ranks from the Mee6 archive.**`);
    },
    "simulate": async (i) => {
        if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin simulate` command.**", ephemeral: true });
        await i.deferReply({ ephemeral: true });

        const { messages } = Vidar.args(i);
        const user = await i.user.fetch(true);

        await simulateMessages(user, messages, false);
        await i.editReply(`> ✅ **Successfully simulated messages for user:** ${user}`);
    },
});

Vidar.command("levels", "View Discord message XP leaderboards.")
.action(i => sendLeaderboardsMessage(i));