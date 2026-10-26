import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import config from "../../../config/config.json" with { type: "json" };

const MAX_MESSAGES = 5;
const WINDOW_MS = 60 * 1000;
const TIMEOUT_MS = 60 * 1000;
const WARNING_DELETE_MS = 10 * 1000;

const URL_REGEX = /^(https?:\/\/|www\.)\S+$/i;
const MENTION_OR_EMOJI_REGEX = /^(<@[!&]?\d+>|<#\d+>|<a?:[A-Za-z0-9_]+:\d+>)$/;

interface Chain {
  authorId: string;
  messageIds: string[];
  startedAt: number;
}

const chains = new Map<string, Chain>();

export default {
  name: "antiSingleWordSpam",
  scope: "global",
  ignoreBots: true,
  allowEdited: false,
  execute: async function(message: Message, client: Client) {
    try {
      const key = `${message.guildId}:${message.channelId}`;

      if (isExempt(message)) {
        chains.delete(key);
        return;
      }

      const now = Date.now();
      const chain = chains.get(key);

      if (!isSingleWordMessage(message)) {
        chains.delete(key);
        return;
      }

      if (
        !chain ||
        chain.authorId !== message.author.id ||
        now - chain.startedAt > WINDOW_MS
      ) {
        chains.set(key, {
          authorId: message.author.id,
          messageIds: [message.id],
          startedAt: now,
        });
        return;
      }

      chain.messageIds.push(message.id);

      if (chain.messageIds.length <= MAX_MESSAGES) return;

      const messageIds = chain.messageIds;
      chains.delete(key);
      await handleTrigger(message, client, messageIds);
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
} as Iautomod;

function isExempt(message: Message): boolean {
  const { guild, member, channel, author } = message;

  if (!guild || !member || !(channel instanceof TextChannel)) return true;
  if (message.system || author.bot) return true;
  if (channel.isThread()) return true;

  if (guild.ownerId === author.id) return true;
  if (config.OWNERS_ID.includes(author.id)) return true;

  if (
    member.permissions.has(PermissionFlagsBits.ManageMessages) ||
    member.permissions.has(PermissionFlagsBits.ModerateMembers)
  ) {
    return true;
  }

  if (channel.name.toLowerCase().startsWith("ticket")) return true;

  if (!Object.values(config.allowedChannels).includes(channel.id)) return true;

  return false;
}

function isSingleWordMessage(message: Message): boolean {
  if (
    message.attachments.size > 0 ||
    message.embeds.length > 0 ||
    message.stickers.size > 0
  ) {
    return false;
  }

  const content = message.content.trim();
  if (!content || content.startsWith(config.prefix)) return false;
  if (content.split(/\s+/).length !== 1) return false;
  if (URL_REGEX.test(content)) return false;
  if (MENTION_OR_EMOJI_REGEX.test(content)) return false;

  return /[\p{L}\p{N}]/u.test(content);
}

async function handleTrigger(
  message: Message,
  client: Client,
  messageIds: string[],
): Promise<void> {
  if (!(message.channel instanceof TextChannel)) return;

  const timedOut = await applyTimeout(message, client);
  await message.channel.bulkDelete(messageIds)
  await notifyUser(message, client, timedOut);

  const timeoutDetail = timedOut
    ? "se le aplicó un timeout de 1 minuto"
    : "no se pudo aplicar el timeout";

  client.automodLogger(
    message,
    client,
    "Spam de mensajes de una palabra",
    `<@${message.author.id}> envió ${messageIds.length} mensajes seguidos de una sola palabra en <#${message.channelId}>; se borraron y ${timeoutDetail}`,
  );
}

async function applyTimeout(
  message: Message,
  client: Client,
): Promise<boolean> {
  if (!message.member) return false;

  try {
    await message.member.timeout(
      TIMEOUT_MS,
      "Spam de mensajes seguidos de una sola palabra",
    );
    return true;
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
    return false;
  }
}

async function notifyUser(
  message: Message,
  client: Client,
  timedOut: boolean,
): Promise<void> {
  const notice = timedOut
    ? "Ey, ¡tranquilo/a! Veo que mandaste varios mensajes seguidos de una sola palabra, así que el bot te dio un descanso rápido de un minuto y limpió el chat. ¡Todo bien, solo intenta no saturar el canal!"
    : "Ey, ¡tranquilo/a! Veo que mandaste varios mensajes seguidos de una sola palabra, así que el bot limpió el chat. ¡Todo bien, solo intenta no saturar el canal!";

  try {
    await message.author.send(notice);
    return;
  } catch (err) {
    const error = err as { code?: number };
    if (error?.code !== 50007) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  }

  if (!(message.channel instanceof TextChannel)) return;

  try {
    const warning = await message.channel.send(
      `<@${message.author.id}> ${notice}`,
    );

    setTimeout(() => {
      warning.delete().catch(() => null);
    }, WARNING_DELETE_MS);
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
}
