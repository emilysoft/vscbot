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
    if (message.author?.bot) return;
    if (message.channel.id === "1024260771326197781") return;
    if (!message.attachments || message.attachments.size === 0) return;
    if (!message.guild || message.guild.id !== MAIN_SERVER) return;

    let member = message.member;
    if (!member && message.guild) {
      try {
        member = await message.guild.members.fetch(message.author.id);
      } catch {
        member = null;
      }
    }

    const avatarPhoto =
      member?.displayAvatarURL() ?? message.author.displayAvatarURL();
    const botAvatar = client.user?.displayAvatarURL() ?? "";
    const botsChannel = await resolveLogsChannel(message.guild);

    if (!botsChannel) {
      console.error(
        "[deleteLogger] No se pudo resolver el canal de logs:",
        LOGS_CHANNEL_ID,
      );
      return;
    }

    let index = 0;
    for (const attachment of message.attachments.values()) {
      index++;
      const contentType = attachment.contentType?.toLowerCase() ?? "";

      let format: string | null = null;
      if (contentType.startsWith("image/")) format = "png";
      else if (contentType.startsWith("video/")) format = "mp4";

      if (!format) continue;

      // Garantiza un nombre único por cada adjunto en el mensaje
      const uniqueFileName = `${message.id}_${index}`;
      const attachmentTag = `${uniqueFileName}.${format}`;

      try {
        // NOTA: Si esto corre en messageDelete, attachment.url puede dar 403/404 al intentar descargar
        const filePath = await downloadFromURL(
          attachment.url,
          format,
          uniqueFileName,
        );
        if (!filePath) continue;

        const attachmentFile = new AttachmentBuilder(filePath, {
          name: attachmentTag,
        });

        const baseEmbed = new EmbedBuilder()
          .setColor(config.EMBED_COLOR as ColorResolvable)
          .setTitle(message.author.username)
          .setDescription(
            `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>**`,
          )
          .setAuthor({ name: message.author.username, iconURL: avatarPhoto })
          .setTimestamp()
          .setFooter({
            text: `Author: ${message.author.id} | Message ID: ${message.id}`,
            iconURL: botAvatar,
          });

        if (format === "png") {
          baseEmbed.setImage(`attachment://${attachmentTag}`);
        }

        await botsChannel.send({
          embeds: [baseEmbed],
          files: [attachmentFile],
        });

        await clearDownload(filePath);
      } catch (err) {
        console.error("[deleteLogger] Error al procesar el adjunto:", err);
      }
    }
  } catch (err) {
    if (typeof client.errorLogger === "function") {
      client.errorLogger(err, client, "error", process.cwd());
    } else {
      console.error("[deleteLogger] Unhandled error:", err);
    }
  }
};

export default module;
