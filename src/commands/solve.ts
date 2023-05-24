import { ChatInputCommandInteraction, EmbedBuilder, Interaction, SlashCommandBuilder, APIApplicationCommandOptionChoice, AttachmentPayload, AttachmentBuilder, JSONEncodable, bold } from "discord.js";
import { Command } from "../structures/Command";
import { Puzzle, PuzzleType } from "../structures/Puzzle";
import { embedColor } from "../constants";

const commandData = new SlashCommandBuilder()
    .addStringOption(option =>
        option
            .setName('scramble')
            .setDescription("The scramble you want to solve.")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('puzzle')
            .setDescription("The type of puzzle wanted.")
            .addChoices(
                { name: "2x2", value: "2x2x2" },
                { name: "3x3", value: "3x3x3" }
            )
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('setup-moves')
            .setDescription("Moves before the scramble.")
            .setRequired(false)
    )
    .setName('solve')
    .setDescription("Solves the cube with the given scramble.");

const commandFunction = async function (interaction: Interaction): Promise<null> {
    // Make sure we have a guild we can work with
    if (!interaction.guild) return null;
    if (!interaction.guild.available) return null;

    if (interaction instanceof ChatInputCommandInteraction) {
        const scramble: string | null = interaction.options.getString('scramble');
        const premoves: string | null = interaction.options.getString('setup-moves');
        const rawPuzzleType: string | null = interaction.options.getString('puzzle');

        const errorEmbed: EmbedBuilder = new EmbedBuilder({
            description: `Information given was incorrect.`,
            color: embedColor
        });

        if (!scramble || !rawPuzzleType) {
            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        if (!Puzzle.isPuzzleType(rawPuzzleType)) {
            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        const puzzleType: PuzzleType = rawPuzzleType as PuzzleType;
        const puzzle: Puzzle = new Puzzle(puzzleType);

        // Adds the premoves, if any.
        if(premoves) {
            const premoveAlgorithm: string | null = Puzzle.convertToAlgorithm(premoves, puzzleType);
            if(!premoveAlgorithm) {
                const errorEmbed: EmbedBuilder = new EmbedBuilder({
                    description: `One of the element in the setup moves notation is incorrect.`,
                    color: embedColor
                });
    
                interaction.editReply({ embeds: [errorEmbed] })
                    .catch(err => console.error(err));
                return null;
            }

            puzzle.addMoves(premoveAlgorithm);
        }

        // Adds the scramble.
        const algorithm: string | null = Puzzle.convertToAlgorithm(scramble, puzzleType);

        if (!algorithm) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder({
                description: `One of the element in the moves notation is incorrect.`,
                color: embedColor
            });

            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        puzzle.addMoves(algorithm);

        let solveAlgorithm: string;

        let startTimestamp: number = 0;
        let endTimestamp: number = 0;

        try {
            startTimestamp = performance.now();
            const result: string | null = puzzle.solve();
            endTimestamp = performance.now();

            if (!result) {
                const errorEmbed: EmbedBuilder = new EmbedBuilder({
                    description: `Failed to solve the puzzle.`,
                    color: embedColor
                });

                interaction.editReply({ embeds: [errorEmbed] })
                    .catch(err => console.error(err));
                return null;
            }
            solveAlgorithm = result;
        } catch (err) {
            console.error(err);
            return null;
        }   
        
        const differenceTimestamp = endTimestamp - startTimestamp;

        if (solveAlgorithm) {
            const embed: EmbedBuilder = new EmbedBuilder({
                description: `Solution to the scramble is: ${bold(solveAlgorithm)}` + `\n` + bold(`Solution calculated in ${(differenceTimestamp/1000).toFixed(3)} seconds!`),
                color: embedColor
            });

            interaction.editReply({ embeds: [embed] })
                .catch(err => console.error(err));
        }
    }

    return null;
}

const command: Command = new Command(commandData, commandFunction, __filename);

module.exports = command;