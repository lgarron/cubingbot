import { EventHandler } from "../structures/EventHandler";
import { Command } from "../structures/Command";
import { ChatInputCommandInteraction, ClientEvents, EmbedBuilder, Interaction } from "discord.js";
import { embedColor } from "../constants";

const handler = async function (interaction: Interaction): Promise<void> {
    // This is a DM.
    if (!interaction.guild) return;
    // Guild is unavailable (for some reason).
    if (!interaction.guild.available) return;

    // This interaction is the one we can reply to.
    if (interaction instanceof ChatInputCommandInteraction) {
        // Defer the reply first.
        await interaction.deferReply();

        const command: Command | undefined = Command.commands.get(interaction.commandName);

        if (!command) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder({
                description: `Incorrect command.`,
                color: embedColor
            });

            interaction.editReply({ embeds: [errorEmbed] })
                .catch(err => console.error(err));
            
            return;
        }

        command.run(interaction);
    }
};

const event: EventHandler = new EventHandler('interactionCreate', handler);
module.exports = event;