import { EmbedBuilder } from "discord.js"
import config from "../config.json" with {type:"json"} 
const module = async (channel) => {
    if (channel.name.startsWith("ticket")) return;
    if (channel.parentId == "1122175563688317058") return;
    const botAvatar = channel.client.user.displayAvatarURL();
    const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR)
        .setTitle("Aviso al administrador")
        .setDescription(
            `<@240254129333731328> moderará este nuevo canal, usa >>ignore ${channel.id} para desactivarlo.`
        )
        .setAuthor({
            name: channel.client.user.username,
        })
        .setTitle("Aviso del automod")
        .setFooter({
            text: channel.client.user.username,
            iconURL: botAvatar,
        });
    await channel.send({ embeds: [embed] });
};
export default module
