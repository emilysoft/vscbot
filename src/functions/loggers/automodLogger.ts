import { ColorResolvable, EmbedBuilder, Message, TextChannel } from "discord.js"
import config from "../../config/config.json" with {type: "json"}
import Client from "../../interfaces/ICustomClient.js"
const module = async (message: Message, client: Client, reason: string, description: string) => {
  try {
    const logChannelId = "936038476334370896";
    const botAvatar = message.client.user.displayAvatarURL();
    const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
    const exampleEmbed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .setTitle(`${reason}`)
      .setAuthor({ name: message.author.tag, iconURL: avatarPhoto })
      .setDescription(`${description}.`)
      .setTimestamp()
      .setFooter({
        text: `user ID: ${message.author.id}`,
        iconURL: botAvatar,
      });
    const channel = client.channels.cache.find(
      (channel) => channel.id === logChannelId
    );
    if (channel instanceof TextChannel)
      channel.send({ embeds: [exampleEmbed] });
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
};

export default module
