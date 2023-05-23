import { ChatInputCommandInteraction, EmbedBuilder, Interaction, SlashCommandBuilder, bold, AttachmentPayload, AttachmentBuilder, JSONEncodable, Message, Attachment } from "discord.js";
import { Command } from "../structures/Command";
import { Puzzle, PuzzleType } from "../structures/Puzzle";
import { embedColor, github } from "../constants";
import { getImageBuffer } from "../helpers/getImageBuffer";

const commandData = new SlashCommandBuilder()
    .addStringOption(option =>
        option
            .setName('puzzle')
            .setDescription("The type of puzzle wanted.")
            .addChoices(
                { name: "2x2", value: "2x2x2" },
                { name: "3x3", value: "3x3x3" },
                { name: "4x4", value: "4x4x4" },
                { name: "5x5", value: "5x5x5" },
                { name: "6x6", value: "6x6x6" },
                { name: "7x7", value: "7x7x7" },
                { name: "Pyraminx", value: "pyraminx" },
                { name: "Megaminx", value: "megaminx" },
                { name: "Skewb", value: "skewb" },
                { name: "Square1", value: "square1" }
            )
            .setRequired(true)
    )
    .addBooleanOption(option =>
        option
            .setName('onehanded')
            .setDescription("Whether or not the event is OH (3x3 only).")
            .setRequired(false)
    )
    .addBooleanOption(option =>
        option
            .setName('blindfolded')
            .setDescription("Whether or not the event is blindfolded (3x3, 4x4 and 5x5 only).")
            .setRequired(false)
    )
    .addBooleanOption(option =>
        option
            .setName('multiblindfolded')
            .setDescription("Whether or not the event is multi-blindfolded (3x3 only).")
            .setRequired(false)
    )
    .setName('scramble')
    .setDescription("Generates a scramble for a choosen puzzle.");

const commandFunction = async function (interaction: Interaction): Promise<null> {
    // Make sure we have a guild we can work with
    if (!interaction.guild) return null;
    if (!interaction.guild.available) return null;

    if (interaction instanceof ChatInputCommandInteraction) {
        const rawPuzzleType: string | null = interaction.options.getString('puzzle');

        const errorEmbed: EmbedBuilder = new EmbedBuilder({
            description: `Information given was incorrect.`,
            color: embedColor
        });

        if (!rawPuzzleType) {
            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        if (!Puzzle.isPuzzleType((rawPuzzleType))) {
            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        const puzzleType = rawPuzzleType as PuzzleType;
        const puzzle: Puzzle = new Puzzle(puzzleType);

        // If the options return null, then !!null -> false
        // So all good ^^
        const isMultiblindfolded: boolean = !!interaction.options.getBoolean('multiblindfolded');
        const isBlindfolded: boolean = !!interaction.options.getBoolean('blindfolded');
        const isOneHanded: boolean = !!interaction.options.getBoolean('onehanded');

        const startTimestamp: number = performance.now();
        let scramble: string[] | string | null = puzzle.scramble(isBlindfolded, isMultiblindfolded, isOneHanded);
        const endTimestamp: number = performance.now();

        if (!scramble) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder({
                description: `Failed to generate a scramble.`,
                color: embedColor
            });

            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        const differenceTimestamp: number = endTimestamp - startTimestamp;

        if (Array.isArray(scramble)) scramble = scramble.join("\n");

        const embed: EmbedBuilder = new EmbedBuilder({
            description: `A scramble for this event is: ${bold(scramble)}` + `\n` + bold(`Scramble(s) generated in ${(differenceTimestamp / 1000).toFixed(3)} seconds!\nThis bot is an open-source project. See the GitHub repo for more info!`),
            color: embedColor
        });

        interaction.editReply({ embeds: [embed] })
            .catch(err => console.error(err));

    }
    return null;
}

const command: Command = new Command(commandData, commandFunction, __filename);

module.exports = command;