const { EmbedBuilder } = require("discord.js");
const errorLogger = require('./errorLogger')
module.exports = async (message, client, reason, description) => {
    try {
        const logChannelId = "936038476334370896";
        const botAvatar =
            "https://cdn.discordapp.com/avatars/883827073049845801/c821a559d8df0079beb33abf9c6eeeda.png?size=96&quality=lossless";
        const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        const exampleEmbed = new EmbedBuilder()
            .setColor("#ADD8E6")
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
