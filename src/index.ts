import { commands } from "@brynjolf/commands";
import { events } from "@brynjolf/events";
import { GUILDS } from "./systems/constants.js";
import { Client, IntentsBitField } from "discord.js";

// Import commands
import "./commands/cmd-version.js";
import "./commands/cmd-yeanay.js";
import "./commands/cmd-reactionroles.js";
import "./commands/cmd-statsadmin.js";
import "./commands/cmd-rank.js";

// Import event systems
import "./events/ruleroles.js";
import "./events/reactionroles.js";
import "./events/suggestions.js";
import "./events/stats.js";
import "./events/ranks.js";
import "./events/ready.js";
import "./events/commands.js";

// Register commands
for (const guild of GUILDS) {
    commands.setToken(process.env.BOT_TOKEN!, process.env.BOT_APP_ID!, guild);
    commands.registerAll();
}

// Run web server
import "./systems/api.js";

// Create Discord client
const client = new Client({ intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent
]});
client.login(process.env.BOT_TOKEN);

// Register events
events.client(client);