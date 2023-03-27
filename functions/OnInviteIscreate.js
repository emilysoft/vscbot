const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../config.json");
const errorLogger = require("./loggers/errorLogger");
module.exports = async (client, invite) => {
    try {
        if (invite.inviter.bot) return;
        const logChannelId = "1018749794736414720";
        const botAvatar = client.user.displayAvatarURL();
        const exampleEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`Invitación creada`)
            .setAuthor({ name: invite.inviter.tag, iconURL: invite.avatar })
            .setDescription(
                `<@${invite.inviter.id}> creó una invitación en <#${invite.channel.id}>`
            )
            .setTimestamp()
            .setFooter({
                text: `user ID: ${invite.inviter.id}`,
                iconURL: botAvatar,
            });
        const channel = client.channels.cache.find(
            (channel) => channel.id === logChannelId
        );
        await channel.send({ embeds: [exampleEmbed] });
    } catch (err) {
        errorLogger(err, client, "error");
    }
};
