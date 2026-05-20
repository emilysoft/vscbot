import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js"
import config from "../../config/config.json"  with {type: "json"}
const module = async (channel: TextChannel) => {
  if (channel.name.startsWith("ticket")) return;
  if (channel.parentId == "1122175563688317058") return;
  const botAvatar = channel.client.user.displayAvatarURL();
  const embed = new EmbedBuilder()
    .setColor(config.EMBED_COLOR as ColorResolvable)
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
  channel.send({ embeds: [embed] });
};
export default module
