import { Guild, ColorResolvable, EmbedBuilder, Message, TextChannel } from "discord.js"
import config from "../../config/config.json" with {type: "json"}
import dotenv from "dotenv"
const categories = [
  "813538324320092162",
  "836011738662961162",
  "813564125380214785",
  "1122175563688317058",
];
dotenv.config()
const MAIN_SERVER = process.env.MAIN_SERVER
const module = async (message: Message) => {
  const { guild, author, attachments, channel, content } = message;
  if (!(guild instanceof Guild)) return
  if (guild.id != MAIN_SERVER) return
  let messageContent = "";
  if (message.content.length) messageContent = content;
  if (channel instanceof TextChannel != true) return
  if (!categories.includes(channel.parentId as string)) return;
  if (attachments.size > 0) {

    const image = attachments.first();
    const url = image
    const embed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .setTitle(
        `Image sent by ${author.username} Deleted in <#${channel.id}>`
      )
      .setAuthor({ name: `${author.username}` })
      .setDescription(`${author.username}: ${messageContent}`)
      .setTimestamp()
      //.setImage()
      .setFooter({
        text: author.id,
      });
    if (!guild) return
    const channelRespond = guild.channels.cache.get("1160325903461666927")
    if (channelRespond instanceof TextChannel != true) return
    channelRespond.send({ embeds: [embed] });
  }
};

export default module
