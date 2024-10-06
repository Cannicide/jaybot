import { listener } from "@brynjolf/events";
import { setTimeout as wait } from "node:timers/promises";
import type { GuildMember } from "discord.js";

class RuleRolesListener {
    @listener("guildMemberUpdate")
    async onRulesAccepted(oldMember: GuildMember, newMember: GuildMember) {
        if (!oldMember || !newMember) return;
        if (!oldMember.pending || newMember.pending) return;

        const roles = await newMember.guild.roles.fetch();
        const survivor = roles.find(r => r.name.toLowerCase() == "survivor");
        if (!survivor) return;

        await wait(1000);
        newMember.roles.add(survivor, "Jaybot Rule Role System.");
    }
}

new RuleRolesListener();