import { Message, EmbedBuilder, ColorResolvable } from "discord.js";
import config from "./../../config.json" with {type: "json"}
export default async function sendDM(message: Message, mensaje: string) {
    if (!message.member) return
    if (!message.guild) return
    const avatarPhoto = message.member.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const name = message.guild.name
    const invites = await message.guild.invites.fetch()
    const invite = invites.first()?.url;
    if (!name && !invite) return
    const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR as ColorResolvable)
        .setTitle(message.author.username)
        .setDescription(mensaje)
        .setAuthor({
            name: message.author.username,
            iconURL: avatarPhoto,
        })
        .setTimestamp()
        .setFooter({
            text: `${name} | ${invite}`,
            iconURL: botAvatar,
        });
    await message.member.user.createDM().then(async (dm) => {
        await dm.send({
            embeds: [embed],
        });
    });
}
