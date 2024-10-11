import { EmbedBuilder } from "discord.js"
import errorLogger from "../../loggers/errorLogger"
import config from "../../config.json" with {type:"json"}
const mutedChannelID = "";
const module = (member) => {
    if (member.user.bot) return;
    try {
        member.roles.cache.find(async (role) => {
            if ((role.id == "muted") | (role.id == "")) {
                const avatarPhoto = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`;
                const botAvatar = client.user.displayAvatarURL();
                const mutedChannel = client.channels.cache.find(
                    (channel) => channel.id === mutedChannelID
                );
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLOR)
                    .setTitle(`Muted`)
                    .setAuthor({
                        name: member.user.username,
                        iconURL: avatarPhoto,
                    })
                    .setDescription(`Has sido muteado por el automod`)
                    .setTimestamp()
                    .setFooter({
                        text: type,
                        iconURL: botAvatar,
                    });
                await mutedChannel.send({
                    content: `<@${member.user.id}> has sido muteado/a`,
                    embeds: [embed],
                });
            }
        });
    } catch (err) {
        errorLogger(err, member.client, "error");
    }
};

export default module 
