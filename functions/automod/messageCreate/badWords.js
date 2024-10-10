const errorLogger = require("../../loggers/errorLogger");
const badWords = require("./badWords.json");
const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../../config.json");
const badWordsRegexed = badWords.map((word) => new RegExp(word, "gim"));
module.exports = (message) => {
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
        errorLogger(err, message.client, "error");
    }
};

function sendMessage(message) {
    const avatarPhoto = message.member.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const botsChannel = message.guild.channels.cache.find(
        (channel) => channel.id === "1270476028619260018"
    );
    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
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
