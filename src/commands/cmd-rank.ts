import { Command, opts, Adapter } from "@brynjolf/commands";
import {
    getUser,
    sendRankCardMonthly,
    sendRankCard,
    sendLeaderboardsMessage,
    removeUser,
    setXp,
    clearXp,
    updateRank as simulateMessages
} from "../systems/ranks.js";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";

// Utils

const rankCommand = async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return;

    await i.deferReply();
    const user = i.options.getUser("user", false);

    const playerRank = await getUser(user?.id ?? i.user.id);
    if (!playerRank || !playerRank.playerId) return await i.editReply(`> <:no:669928674119778304> **${user ? "The provided user does" : "You do"} not have a rank yet.**`);

    let member;
    try {
        member = user ? await i.guild.members.fetch(user.id) : i.member as GuildMember;
    }
    catch {
        member = null;
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

// Args

const userArg = opts.user({ name: "user", desc: "OPTIONAL user to view rank of." });

const removeCmd = opts.subc({
    name: "remove",
    desc: "Admin-only command to remove a user rank."
});
removeCmd.suboptions([
    opts.user({ name: "user", desc: "User to remove.", req: true })
]);

const importCmd = opts.subc({ name: "import", desc: "Admin-only command to import a user rank." });
importCmd.suboptions([
    opts.user({ name: "user", desc: "User to import.", req: true }),
    opts.int({ name: "xp", desc: "XP to set.", req: true }),
    opts.int({ name: "level", desc: "Level to set.", req: true })
]);

const clearCmd = opts.subc({ name: "clear", desc: "Admin-only command to clear rank data." });

const simulateCmd = opts.subc({ name: "simulate", desc: "Admin-only command to simulate xp gain." });
simulateCmd.suboptions([
    opts.int({ name: "messages", desc: "Number of messages to simulate.", req: true })
]);

// Commands

new Command("rank", "View your Discord message XP rank.")
.args`[${userArg}]`
.adapter(Adapter.DJS)
.execute(rankCommand);

new Command("rankmonthly", "View your Discord message XP monthly rank.")
.args`[${userArg}]`
.adapter(Adapter.DJS)
.execute(rankCommand);

new Command("rankadmin", "Command to manage ranks.")
.options(removeCmd)
.options(importCmd)
.options(clearCmd)
.options(simulateCmd)
.adapter(Adapter.DJS)
.execute(async i => {
    const sub = i.options.getSubcommand(true);
    switch (sub) {
        case "remove":
            if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin remove` command.**", ephemeral: true });
            await i.deferReply({ ephemeral: true });
            
            const user0 = i.options.getUser("user", true);
            if (user0) await removeUser(user0.id);
            else return await i.editReply("> <:no:669928674119778304> **Failed to retrieve the provided user.**");

            await i.editReply(`> ✅ **Successfully removed rank of user:** ${user0}`);
        return;
        case "import":
            if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin import` command.**", ephemeral: true });
            await i.deferReply({ ephemeral: true });

            const user1 = i.options.getUser("user", true);
            const xp = i.options.getInteger("xp", true);
            const level = i.options.getInteger("level", true);

            if (user1) await setXp(user1.id, xp, level, 0, user1.username, user1.displayAvatarURL());
            else return await i.editReply("> <:no:669928674119778304> **Failed to retrieve the provided user.**");

            await i.editReply(`> ✅ **Successfully imported rank of user:** ${user1}`);
        return;
        case "clear":
            if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin clear` command.**", ephemeral: true });
            await i.deferReply({ ephemeral: true });

            await clearXp();
            await i.editReply(`> ✅ **Successfully cleared rank data.**`);
        return;
        case "simulate":
            if (i.user.id != "274639466294149122") return await i.reply({ content: "> <:no:669928674119778304> **Only Cannicide is allowed to use the `/rankadmin simulate` command.**", ephemeral: true });
            await i.deferReply({ ephemeral: true });

            const messages = i.options.getInteger("messages", true);
            const user = await i.user.fetch(true);

            await simulateMessages(user, messages, false);
            await i.editReply(`> ✅ **Successfully simulated messages for user:** ${user}`);
        return;
    }
});

new Command("levels", "View Discord message XP leaderboards.")
.adapter(Adapter.DJS)
.execute(i => sendLeaderboardsMessage(i));