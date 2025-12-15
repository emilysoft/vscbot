import badWords from "../../../config/badWords.json" with {type: "json"}
import { ColorResolvable, EmbedBuilder, Message, TextChannel } from "discord.js"
import config from "../../../config/config.json" with {type: "json"}
import Client from "../../../interfaces/ICustomClient.js"
const badWordsRegexed = badWords.map((word) => new RegExp(word, "gim"));
import Iautomod from "../../../interfaces/Iautomod.js"

export default {
    name: "bannedWords",
    scope: "guild",
    ignoreBots: true,
    execute: async function(message: Message, client: Client) {
        try {
            if (message.channel.id == "1024260771326197781") return;
            for (const regex of badWordsRegexed) {
                if (message.content.match(regex) != null) {
                    sendMessage(message);
                    break;
                }
            }
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod

function sendMessage(message: Message) {
    if (!message.member || !message.guild) return
    const avatarPhoto = message.member.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const botsChannel = message.guild.channels.cache.find(
        (channel) => channel.id === "1270476028619260018"
    );
    const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR as ColorResolvable)
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

    if (botsChannel instanceof TextChannel)
        botsChannel.send({
            embeds: [embed],
        });
}
