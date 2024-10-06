import { listener } from "@brynjolf/events";
import { statsSave, statsDisplay } from "../systems/stats.js";
import { STATS_INTERVAL_MINS } from "../systems/constants.js";
import type { Client } from "discord.js";

class StatsListener {
    @listener("ready")
    onStart(client: Client) {
        setInterval(() => statsSave(client), STATS_INTERVAL_MINS * 60 * 1000);
        setTimeout(() => setInterval(() => statsDisplay(client), STATS_INTERVAL_MINS * 60 * 1000), 2000);
    }
}

new StatsListener();