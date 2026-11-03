import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js"
import config from "../../config/index.js"
const module = async (channel: TextChannel) => {
  if (channel.name.startsWith("ticket")) return;
  if (channel.parentId == config.categories.tickets) return;
  const botAvatar = channel.client.user.displayAvatarURL();
  const embed = new EmbedBuilder()
    .setColor(config.embedColor as ColorResolvable)
    .setTitle("Aviso al administrador")
    .setDescription(
      `<@${config.users.vortex}> moderará este nuevo canal, usa >>ignore ${channel.id} para desactivarlo.`
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
