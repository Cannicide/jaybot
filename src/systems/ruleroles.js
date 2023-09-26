const { createEvent, Discord, wait } = require("../panacea");

createEvent({
    name: "guildMemberUpdate",
    /**
     * @param {Discord.GuildMember} oldMember 
     * @param {Discord.GuildMember} newMember 
     * @returns 
     */
    handler: async (oldMember, newMember) => {
        if (!oldMember || !newMember) return;
        if (!oldMember.pending || newMember.pending) return;

        const roles = await newMember.guild.roles.fetch();
        const survivor = roles.find(r => r.name.toLowerCase() == "survivor");

        if (!survivor) return;
        await wait(1000);

        newMember.roles.add(survivor, "Panacea Rule Role System.");
    }
});