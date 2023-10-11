const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../config.json");
const categories = [
    "813538324320092162",
    "836011738662961162",
    "813564125380214785",
    "1122175563688317058",
];
module.exports = async (message) => {
    const { guild, author, attachments, channel, content } = message;
    let messageContent = "";
    if (message.content.length) messageContent = content;
    if (!categories.includes(channel.parentId)) return;
    if (attachments.size > 0) {
        const image = attachments.first().url;
        const embed = new EmbedBuilder()
            .setColor(`${EMBED_COLOR}`)
            .setTitle(
                `Image sent by ${author.username} Deleted in <#${channel.id}>`
            )
            .setAuthor({ name: `${author.username}` })
            .setDescription(`${author.username}: ${messageContent}`)
            .setTimestamp()
            .setImage(image)
            .setFooter({
                text: author.id,
            });
        guild.channels.cache
            .get("1160325903461666927")
            .send({ embeds: [embed] });
    }
};
