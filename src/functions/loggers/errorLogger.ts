import Client from "../../interfaces/ICustomClient.js"
import { Guild, ColorResolvable, EmbedBuilder, TextChannel } from "discord.js"
import dotenv from "dotenv"
dotenv.config()
const MAIN_SERVER = process.env.MAIN_SERVER

enum tipo {
  error = "error",
  warn = "warn"
}
const module = async (error: any, client: Client, type: string, dir = "") => {
  try {

    let errorColor;
    if (type == tipo.error) {
      errorColor = "#FF0000";
      console.error(error);
    } else if (type == tipo.warn) {
      errorColor = "#FFFF00";
      console.warn(error);
    } else {
      throw new Error("Error en especificar el type de error");
    }
    const logChannelId = "1085335051732009113";
    if (!client.user) return
    const botAvatar = client.user.displayAvatarURL();
    const exampleEmbed = new EmbedBuilder()
      .setColor(errorColor as ColorResolvable)
      .setTitle(`${error.code}`)
      .setAuthor({ name: "vscbot", iconURL: botAvatar })
      .setDescription(`\`\`\`\n${error}\`\`\``)
      .setTimestamp()
      .setFooter({
        text: type,
        iconURL: botAvatar,
      });
    const channel = client.channels.cache.find(
      (channel) => channel.id === logChannelId
    );
    if (channel instanceof TextChannel != true) return

    const { guild } = channel
    if (!(guild instanceof Guild)) return
    if (guild.id != MAIN_SERVER) return

    await channel.send({
      content: `<@&1294149003696410665> Error encontrado en: ${dir}`,
      embeds: [exampleEmbed]
    });
  } catch (err) {
    console.error(err);
  }
};

export default module
