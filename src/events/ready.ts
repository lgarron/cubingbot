import { Client } from "discord.js";
import { EventHandler } from "../structures/EventHandler";

const handler = function(client: Client): void {
    if(client.user) console.log(`${client.user.tag} logged in!`);
};

const event: EventHandler = new EventHandler('ready', handler);

module.exports = event;