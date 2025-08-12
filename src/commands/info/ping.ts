import { Message, ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ColorResolvable } from "discord.js"
import config from "../../config.json" with {type: "json"}
import ICommand from "../../interfaces/command.js"
const module: ICommand = {
    name: "ping",
    //category: "Utility",
    description: "Muestra mi ping",
    slashCommand: true,
    allowEdited: false,
    cooldown: 3,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Muestra mi ping"),
    async execute(interaction: ChatInputCommandInteraction) {
        ping(interaction);
    },
    async run(message: Message) {
        ping(message);
    },
};

function ping(interaction: ChatInputCommandInteraction | Message) {
    const botAvatar = interaction.client.user.displayAvatarURL();
    const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR as ColorResolvable)
        .setTitle("Ping!")
        .addFields([
            {
                name: "API Latency",
                value: Math.round(interaction.client.ws.ping) + "ms",
            },
        ])
        .setFooter({
            text: interaction.client.user.username,
            iconURL: botAvatar,
        });
    interaction.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
    });
}
export default module
