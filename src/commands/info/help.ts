import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, ColorResolvable } from "discord.js"
import config from "../../config.json" with {type:"json"}
import Client from "./../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "help",
    description: "Mira todos los comandos",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Mira una lista de comandos"),
    slashCommand: true,
    messageCommand: true,
    async execute(interaction: ChatInputCommandInteraction, client:Client) {
        const avatarPhoto = interaction.user.displayAvatarURL();
        help(interaction, avatarPhoto, interaction.user.tag, client);
    },
    async run(message: Message, client:Client) {
        const avatarPhoto = message.author.displayAvatarURL();
        help(message, avatarPhoto, message.author.tag, client);
    },
};

async function help(interaction:Message | ChatInputCommandInteraction, avatarPhoto: string, authorTag: string, client:Client) {
    try {
        const descriptions : string[] = [];
        client.commands.each((command) => {
            if (command.slashCommand || command.messageCommand)
                descriptions.push(
                    `\`>${command.name}\`: ${command.description}`
                );
        });
        const embed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR as ColorResolvable)
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
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}

export default module
