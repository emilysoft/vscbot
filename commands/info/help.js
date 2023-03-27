const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const errorLogger = require("../../functions/loggers/errorLogger");
const { EMBED_COLOR } = require("../../config.json");
module.exports = {
    name: "help",
    description: "Mira todos los comandos",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Mira una lista de comandos"),
    slashCommand: true,
    messageCommand: true,
    async execute(interaction) {
        const avatarPhoto = interaction.user.displayAvatarURL();
        help(interaction, avatarPhoto, interaction.user.tag);
    },
    async run(message) {
        const avatarPhoto = message.author.displayAvatarURL();
        help(message, avatarPhoto, message.author.tag);
    },
};

async function help(interaction, avatarPhoto, authorTag) {
    try {
        const descriptions = [];
        interaction.client.commands.each((command) => {
            if (command.slashCommand || command.messageCommand)
                descriptions.push(
                    `\`>${command.name}\`: ${command.description}`
                );
        });
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`Comandos de ${interaction.client.user.username}`)
            .setAuthor({ name: authorTag, iconURL: avatarPhoto})
            .setDescription(descriptions.join("\n"))
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL(),
            });
        await interaction.reply({
            embeds: [embed],
            allowedMentions: { repliedUser: false },
        });
    } catch (err) {
        errorLogger(err, interaction.client, "error");
    }
}
