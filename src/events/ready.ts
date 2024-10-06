import { listener } from "@brynjolf/events";
import { ActivityType } from "discord.js";
import type { Client } from "discord.js";

class ReadyListener {
    @listener("ready")
    onStart(client: Client) {
        console.log("Panacea up and running!")
        client.user!.setActivity({ name: "ZombieHorde.net", type: ActivityType.Streaming, url: 'https://twitch.tv/cannicide' });
    }
}

new ReadyListener();