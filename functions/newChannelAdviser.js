const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config.json");
module.exports = async (channel) => {
    if (channel.name.startsWith("ticket")) return;
    const botAvatar = channel.client.user.displayAvatarURL();
    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Aviso al administrador")
        .setDescription(
            `<@240254129333731328> moderará este nuevo canal, usa >>ignore ${channel.id} para desactivarlo.`
        )
        .setAuthor({
            name: channel.client.user.username,
        })
        .setTitle("Aviso del automod")
        .setFooter({
            text: channel.client.user.username,
            iconURL: botAvatar,
        });
    await channel.send({ embeds: [embed] });
};
