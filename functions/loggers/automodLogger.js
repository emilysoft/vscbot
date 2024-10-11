import { EmbedBuilder } from "discord.js"
import errorLogger from "./errorLogger.js"
import config from "../../config.json" with {type:"json"}
const module = async (message, client, reason, description) => {
    try {
        const logChannelId = "936038476334370896";
        const botAvatar = message.client.user.displayAvatarURL();
        const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        const exampleEmbed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR)
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
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};

export default module
