const { EmbedBuilder } = require("discord.js");
const errorLogger = require('./errorLogger')
const { EMBED_COLOR } = require("../../config.json");
module.exports = async (message, client, reason, description) => {
    try {
        const logChannelId = "936038476334370896";
        const botAvatar = message.client.user.displayAvatarURL(); 
        const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        const exampleEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`${reason}`)
            .setAuthor({ name: message.author.tag, iconURL: avatarPhoto })
            .setDescription(`${description} en <#${message.channelId}>`)
            .setTimestamp()
            .setFooter({
                text: `user ID: ${message.author.id}`,
                iconURL: botAvatar,
            });
        const channel = client.channels.cache.find(
            (channel) => channel.id === logChannelId
        );
        await channel.send({ embeds: [exampleEmbed] });
    }
    catch (err) {
        errorLogger(err, message.client, "error");
    }
};
