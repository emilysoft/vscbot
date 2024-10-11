import errorLogger from "../../loggers/errorLogger.js"
import badWords from "./badWords.json" with {type:"json"}
import { EmbedBuilder } from "discord.js"
import config from "../../../config.json" with {type:"json"}
const badWordsRegexed = badWords.map((word) => new RegExp(word, "gim"));
const module = (message) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id == "1024260771326197781") return;
        for (let regex of badWordsRegexed) {
            if (message.content.match(regex) != null) {
                sendMessage(message);
                break;
            }
        }
    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
};

function sendMessage(message) {
    const avatarPhoto = message.member.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const botsChannel = message.guild.channels.cache.find(
        (channel) => channel.id === "1270476028619260018"
    );
    const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR)
        .setTitle(message.author.username)
        .setDescription(
            `**Swear words sent by <@${message.author.id}> in ${message.url}**\n**Message:**\n${message.content}`
        )
        .setAuthor({
            name: message.author.username,
            iconURL: avatarPhoto,
        })
        .setTimestamp()
        .setFooter({
            text: `author: ${message.author.id} | Message ID: ${message.id}`,
            iconURL: botAvatar,
        });

    botsChannel.send({
        embeds: [embed],
    });
}
export default module
