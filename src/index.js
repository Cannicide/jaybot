// Setup bots

const Vidar = require("djs-vidar");
const { client, events, Discord, constants } = require("./panacea");

Vidar.initialize({
    client,
    commandPath: Vidar.dirname() + "/commands",
    debugGuilds: constants.guilds
});

Vidar.loadFiles(Vidar.dirname() + "/systems").then(() => {
    // Setup event handlers

    events.forEach((event) => {
        client.on(event.name, event.handler);
    });
});

client.on("ready", () => {
    console.log("Panacea up and running!")
    client.user.setActivity({ name: "ZombieHorde.net", type: Discord.ActivityType.Streaming, url: 'https://twitch.tv/cannicide' });
});

client.login(constants.token);