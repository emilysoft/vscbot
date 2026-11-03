import { EmbedBuilder, MessageReaction, TextChannel, User } from "discord.js";
import config from "../config/index.js";

const CONFIG = {
  emote: "kek",
  threshold: 6,
  channelId: config.channels.starboard,
};

const targetChannels = [
  config.channels.panaderia, // general
  config.channels.general, // general 2
  config.channels.cienciasSociales, // general ccss
  config.channels.memes, // memes
];

const postedMessages = new Set<string>();

function isMediaAttachment(attachment: { contentType?: string | null; url: string }): boolean {
  if (attachment.contentType) {
    return attachment.contentType.startsWith("image/") || attachment.contentType.startsWith("video/");
  }
  return /\.(png|jpe?g|gif|webp|bmp|mp4|webm|mov|avi|m4v)$/i.test(attachment.url);
}

function sanitize(text: string): string {
  return text
    .replace(/<@/gim, "<!@")
    .replace(/@everyone/gim, "@!everyone")
    .replace(/@here/gim, "@!here");
}

const module = async (reaction: MessageReaction, _user: User) => {
  if (!targetChannels.includes(reaction.message.channel.id)) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  const { message, emoji, count } = reaction;

  if (message.author?.id == config.bots.genAi) return; // genai
  if (emoji.name !== CONFIG.emote && emoji.id !== CONFIG.emote) return;
  if (count < CONFIG.threshold) return;
  if (postedMessages.has(message.id)) return;

  if (message.partial) {
    try { await message.fetch(); } catch { return; }
  }

  if (!message.author) return;

  const channel = reaction.client.channels.cache.get(CONFIG.channelId) as TextChannel;
  if (!channel) return;

  const mediaAttachment = message.attachments.find(a => isMediaAttachment(a));
  const channelName = (message.channel as TextChannel).name || "unknown";

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL(),
    })
    .addFields({
      name: `${emoji} **${count}**`,
      value: `[Ir al mensaje](${message.url})`,
    })
    .setFooter({ text: `#${channelName}` })
    .setTimestamp(message.createdAt);

  if (message.content) {
    embed.setDescription(sanitize(message.content.slice(0, 4096)));
  }

  if (mediaAttachment) {
    embed.setImage(mediaAttachment.url);
  }

  try {
    await channel.send({ embeds: [embed] });
    postedMessages.add(message.id);
  } catch (err) {
    console.error("Error al enviar el meme:", err);
  }
};

export default module;
