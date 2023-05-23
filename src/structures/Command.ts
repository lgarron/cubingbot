import { Collection, Interaction, SlashCommandBuilder } from "discord.js";
import path from "path";
export type CommandFunction = ((interaction: Interaction) => null) | ((interaction: Interaction) => Promise<null>);

export class Command {
    public static commands: Collection<string, Command>;

    public readonly data: SlashCommandBuilder;
    public readonly run: CommandFunction;
    private _filePath: string;

    constructor(data: SlashCommandBuilder, run: CommandFunction, fp:string) {
        this.data = data;
        this.run = run;
        this._filePath = fp;
    }

    get name(): string {
        // Le nom du fichier en remplaçant l'extension par une chaîne de caractères vide.
        // Soit le nom du fichier sans l'extension.
        return path.basename(this._filePath).replace(
            path.extname(this._filePath),
            ''
        );
    }
}