import { ChatInputCommandInteraction, EmbedBuilder, Interaction, SlashCommandBuilder, bold, AttachmentPayload, AttachmentBuilder, JSONEncodable, Message, Attachment } from "discord.js";
import { Command } from "../structures/Command";
import { Puzzle, PuzzleType } from "../structures/Puzzle";
import { embedColor, github } from "../constants";
import { getImageBuffer } from "../helpers/getImageBuffer";

const commandData = new SlashCommandBuilder()
    .addStringOption(option =>
        option
            .setName('moves')
            .setDescription("The sequence of moves (algorithm) to apply to the cube.")
            .setRequired(true)
    )
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
                { name: "Skewb", value: "skewb" }
            )
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('setup-moves')
            .setDescription("A sequence of moves (algorithm) to apply to the cube before the other one.")
            .setRequired(false)
    )
    .addIntegerOption(option =>
        option
            .setName('size')
            .setDescription("The height of the image (width will vary depending on the puzzle choosen).")
            .setMinValue(150)
            .setMaxValue(1800)
            .setRequired(false)
    )
    .setName('image')
    .setDescription("Generates an image of a choosen puzzle with an applied sequence of moves.");

const commandFunction = async function (interaction: Interaction): Promise<null> {
    // Make sure we have a guild we can work with
    if (!interaction.guild) return null;
    if (!interaction.guild.available) return null;

    if (interaction instanceof ChatInputCommandInteraction) {
        const size: number | null = interaction.options.getInteger('size');
        const premoves: string | null = interaction.options.getString('setup-moves');
        const moves: string | null = interaction.options.getString('moves');
        const rawPuzzleType: string | null = interaction.options.getString('puzzle');

        if (!moves || !rawPuzzleType || !Puzzle.isPuzzleType(rawPuzzleType)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder({
                description: `Information given was incorrect.`,

                color: embedColor
            });

            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            return null;
        }

        const puzzleType: PuzzleType = rawPuzzleType as PuzzleType;
        const puzzle: Puzzle = new Puzzle(puzzleType, "");

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

        const algorithm: string | null = Puzzle.convertToAlgorithm(moves, puzzleType);

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

        let imageBuffer: Buffer | null = null;

        let startTimestamp: number = 0;
        let endTimestamp: number = 0;

        try {
            const imgSize: number = size || Puzzle.MEDIUM;
            // Uses our helper function to get the image buffers of the current state of the puzzle and merge them
            startTimestamp = performance.now();
            imageBuffer = await getImageBuffer(puzzle, imgSize);
            endTimestamp = performance.now();
        } catch (err) {
            console.error(err);
        } finally {
            // If image generation succeded, imageBuffer won't be null
            if (imageBuffer === null) {
                const errorEmbed: EmbedBuilder = new EmbedBuilder({
                    description: `Image generation failed.`,
                    color: embedColor
                });

                interaction.editReply({ embeds: [errorEmbed] })
                    .catch(err => console.error(err));
                return null;
            }

            if (endTimestamp === 0 || startTimestamp === 0) {
                const image: AttachmentBuilder = new AttachmentBuilder(imageBuffer);

                interaction.editReply({ files: [image] })
                    .catch(err => console.error(err));
                return null;
            }

            const image: AttachmentBuilder = new AttachmentBuilder(imageBuffer);

            const differenceTimestamp = endTimestamp - startTimestamp;
            const embed: EmbedBuilder = new EmbedBuilder({
                description: bold(`Image generated in ${(differenceTimestamp / 1000).toFixed(3)} seconds!`),
                color: embedColor
            });

            interaction.editReply({ files: [image], embeds: [embed] })
                .catch(err => console.error(err));
        }
    }

    return null;
}

const command: Command = new Command(commandData, commandFunction, __filename);

module.exports = command;