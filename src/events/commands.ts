import { commands } from "@brynjolf/commands";
import { listener } from "@brynjolf/events";
import type { Interaction } from "discord.js";

class CommandsListener {
    @listener("interactionCreate")
    onCommand(i: Interaction) {
        if (!i.isChatInputCommand()) return;
        commands.execute(i.commandName, i);
    }
}

new CommandsListener();