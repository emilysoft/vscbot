import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import errorLogger from "../../functions/loggers/errorLogger.js"
import config from "../../config.json" with {type:"json"}
const module = {
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
            .setColor(config.EMBED_COLOR)
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
        errorLogger(err, interaction.client, "error", import.meta.url);
    }
}

export default module
