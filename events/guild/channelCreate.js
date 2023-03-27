const { Events, EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../config.json");
module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        const botAvatar = channel.client.user.displayAvatarURL(); 
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(
                "Se ha creado un nuevo canal, no olvides configurar el automod aquí, vortex por ejemplo y el vscbot"
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
    },
};
