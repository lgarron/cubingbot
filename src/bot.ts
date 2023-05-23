import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import path from 'path';
import * as dotenv from 'dotenv';
import { deploy } from "./deploy";
import { readFilePathsInDirectorySync } from "./helpers/readFilesInDirectory";
import { EventHandler } from "./structures/EventHandler";

dotenv.config({ path: path.join(__dirname, '..', 'config', '.env') });

export const botClient: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember
    ],
    presence: {
        status: 'online',
        activities: [
            {
                name: "You people solving cubes",
                type: ActivityType.Watching
            }
        ]
    }
});

export async function main() {
    // This dynamically adds commands and pushes them to the Discord API.
    await deploy();

    // Dynamically add event handlers.

    const eventDirectoryPath: string = path.join(__dirname, 'events');
    const eventPaths: string[] = readFilePathsInDirectorySync(eventDirectoryPath, [".ts", ".js"]);
    const events: EventHandler[] = eventPaths.map(cmd => require(cmd));

    for(const handler of events) botClient.on(handler.event, handler.handler);

    botClient.login(process.env.TOKEN);
}

main();