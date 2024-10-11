import { SlashCommandBuilder } from "discord.js"
export default {
    name: "afk",
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Establece tu estado AFK")
        .addStringOption((option) =>
            option.setName("razón").setDescription("texto")
        ),
    description: "Establece tu estado AFK",
    slashCommand: true,
    messageCommand: true,
    async execute(interaction) {
        afk(interaction, interaction.user.id)
    },
    async run(message) {
        afk(message, message.author.id)
    }
};

function afk(interaction, authorID) {
    interaction.reply({
        content: `<@${authorID}> se fue pal coño.`,
        allowedMentions: {
            repliedUser: false,
        },
    });
}
