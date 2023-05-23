import path from 'path';
import { Command } from './structures/Command';
import { Collection, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { readFilePathsInDirectorySync } from './helpers/readFilesInDirectory';


dotenv.config({ path: path.join(__dirname, '..', 'config', '.env') });

/**
 * Tries to deploy the slash (/) commands to the Discord API.
 */
export async function deploy(): Promise<void> {
    if(!process.env.TOKEN) throw new TypeError(`Token is undefined.`);
    if(!process.env.BOT_ID || !process.env.GUILD_ID) throw new TypeError(`IDs are undefined.`);

    const commandDirectoryPath: string = path.join(__dirname, 'commands');
    const commandPaths: string[] = readFilePathsInDirectorySync(commandDirectoryPath, [".ts", ".js"]);
    const rawCommands: Command[] = commandPaths.map(cmd => require(cmd));

    const commandCollections: Collection<string, Command> = new Collection();
    Command.commands = commandCollections;
    
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const command of rawCommands) {
        // Pushes the commands to the API.
        commands.push(command.data.toJSON());

        // Pushes the commands to the Command.commands Collection
        commandCollections.set(command.name, command);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    console.log(`Deploying slash (/) commands on main guild!`);

    await rest.put(
        Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID),
        { body: commands },
    )
    .catch(err => console.error(err));

    console.log(`Slash (/) commands deployed on main guild.`);
}