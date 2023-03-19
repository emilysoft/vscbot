const { Events } = require("discord.js");
module.exports = {
    name: Events.InviteCreate,
    async execute(invite) {
        try {
            if (invite.inviter.bot) return;
            const logChannelId = "1018749794736414720";
            const botAvatar =
                "https://cdn.discordapp.com/attachments/948782010955104376/1018753972091232336/c821a559d8df0079beb33abf9c6eeeda.png";
            const exampleEmbed = new EmbedBuilder()
                .setColor("#ADD8E6")
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
            errorLogger(err, client, 'error')
        }
    },
};
