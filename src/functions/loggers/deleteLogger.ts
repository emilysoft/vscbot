import {
  Guild,
  EmbedBuilder,
  AttachmentBuilder,
  Message,
  TextChannel,
  ColorResolvable,
} from "discord.js";
import config from "../../config/config.json" with { type: "json" };
import Client from "../../interfaces/ICustomClient.js";
import { downloadFromURL, clearDownload } from "../lib/download.js";
import dotenv from "dotenv";
dotenv.config();
const MAIN_SERVER = process.env.MAIN_SERVER;

const LOGS_CHANNEL_ID = "1277121114786496572";

const resolveLogsChannel = async (guild: Guild) => {
  const cached = guild.channels.cache.get(LOGS_CHANNEL_ID);
  if (cached instanceof TextChannel) return cached;
  try {
    const fetched = await guild.channels.fetch(LOGS_CHANNEL_ID);
    return fetched instanceof TextChannel ? fetched : undefined;
  } catch {
    return undefined;
  }
};

const module = async (message: Message, client: Client) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id == "1024260771326197781") return;
    if (message.attachments.size == 0) return;
    if (!message.guild) return;
    if (!(message.guild instanceof Guild)) return;
    if (message.guild.id != MAIN_SERVER) return;

    let member = message.member;
    if (!member) {
      try {
        member = await message.guild.members.fetch(message.author.id);
      } catch {
        member = null;
      }
    }

    const avatarPhoto =
      member?.displayAvatarURL() ?? message.author.displayAvatarURL();
    const botAvatar = message.client.user.displayAvatarURL();
    const botsChannel = await resolveLogsChannel(message.guild);
    if (!botsChannel) {
      console.error(
        "[deleteLogger] no se pudo resolver el canal de logs",
        LOGS_CHANNEL_ID,
      );
      return;
    }

    const fileName = message.id;
    const { attachments } = message;

    const find = (attachment: {
      contentType: string | null;
    }): { format: string; tag: string } | null => {
      switch (attachment.contentType) {
        case "image/jpeg":
        case "image/png":
          return { format: "png", tag: fileName + ".png" };
        case "video/mp4":
        case "video/mov":
        case "video/webm":
          return { format: "mp4", tag: fileName + ".mp4" };
        default:
          return null;
      }
    };

    for (const attachment of attachments.values()) {
      const spec = find(attachment);
      if (!spec) continue;

      const baseEmbed = spec.format === "png"
        ? embedBuilder(
            spec.tag,
            avatarPhoto,
            botAvatar,
            message,
          )
        : new EmbedBuilder()
            .setColor(config.EMBED_COLOR as ColorResolvable)
            .setTitle(message.author.username)
            .setDescription(
              `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>**`,
            )
            .setAuthor({
              name: message.author.username,
              iconURL: avatarPhoto,
            })
            .setTimestamp()
            .setFooter({
              text: `author: ${message.author.id} | Message ID: ${message.id}`,
              iconURL: botAvatar,
            });

      try {
        const filePath = await downloadFromURL(
          attachment.url,
          spec.format,
          fileName,
        );
        if (!filePath) continue;

        await botsChannel.send({
          embeds: [baseEmbed],
          files:
            spec.format === "png"
              ? [new AttachmentBuilder(filePath)]
              : [filePath],
        });

        await clearDownload(filePath);
      } catch (err) {
        console.error("[deleteLogger] error al loguear adjunto", err);
      }
    }
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
};

function embedBuilder(
  imageURL: string,
  avatarPhoto: string,
  botAvatar: string,
  message: Message,
) {
  return new EmbedBuilder()
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .setTitle(message.author.username)
    .setDescription(
      `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>**`,
    )
    .setAuthor({
      name: message.author.username,
      iconURL: avatarPhoto,
    })
    .setImage("attachment://" + imageURL)
    .setTimestamp()
    .setFooter({
      text: `author: ${message.author.id} | Message ID: ${message.id}`,
      iconURL: botAvatar,
    });
}

export default module;
