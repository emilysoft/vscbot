const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../config.json");
module.exports = {
    name: "ping",
    category: "Utility",
    description: "Muestra mi ping",
    slashCommand: true,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Muestra mi ping"),
    async execute(interaction) {
        ping(interaction);
    },
    async run(message) {
        ping(message);
    },
};

function ping(interaction) {
    const botAvatar = interaction.client.user.displayAvatarURL(); 
    let embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
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
