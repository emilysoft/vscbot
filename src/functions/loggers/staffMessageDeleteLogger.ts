import {
  AuditLogEvent,
  EmbedBuilder,
  Guild,
  GuildAuditLogsEntry,
  Message,
  TextChannel,
} from "discord.js";

const CACHE_TTL_MS = 10 * 1000;
const MATCH_WINDOW_MS = 5 * 1000;
const CACHE_WAIT_MS = 1500;
const CACHE_POLL_MS = 100;
const MAX_CONTENT_LENGTH = 1000;
const LOG_COLOR = 0xed4245;

interface CachedDeletedMessage {
  messageId: string;
  authorId: string;
  channelId: string;
  content: string;
  attachments: { name: string; url: string }[];
  deletedAt: number;
}

const recentDeletions = new Map<string, CachedDeletedMessage[]>();
const loggedEntries = new Map<string, number>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cacheKey = (guildId: string, channelId: string, authorId: string) =>
  `${guildId}:${channelId}:${authorId}`;

function pruneCache(now: number): void {
  for (const [key, messages] of recentDeletions) {
    const fresh = messages.filter(
      (message) => now - message.deletedAt <= CACHE_TTL_MS,
    );

    if (fresh.length) {
      recentDeletions.set(key, fresh);
    } else {
      recentDeletions.delete(key);
    }
  }
}

export function rememberDeletedMessage(message: Message): void {
  const { guildId, channelId, author } = message;

  if (!guildId || !author?.id) return;

  const now = Date.now();

  pruneCache(now);

  const key = cacheKey(guildId, channelId, author.id);
  const messages = recentDeletions.get(key) ?? [];

  messages.push({
    messageId: message.id,
    authorId: author.id,
    channelId,
    content: message.content ?? "",
    attachments: [...message.attachments.values()].map((attachment) => ({
      name: attachment.name,
      url: attachment.url,
    })),
    deletedAt: now,
  });

  recentDeletions.set(key, messages);
}

function takeCachedMessage(
  guildId: string,
  channelId: string,
  authorId: string,
  entryTimestamp: number,
): CachedDeletedMessage | undefined {
  const key = cacheKey(guildId, channelId, authorId);
  const messages = recentDeletions.get(key);
  const now = Date.now();

  if (!messages?.length) return;

  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  messages.forEach((message, index) => {
    const distance = Math.abs(message.deletedAt - entryTimestamp);

    if (
      now - message.deletedAt <= CACHE_TTL_MS &&
      distance <= MATCH_WINDOW_MS &&
      distance < bestDistance
    ) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  if (bestIndex === -1) return;

  const [match] = messages.splice(bestIndex, 1);

  if (!messages.length) recentDeletions.delete(key);

  return match;
}

async function waitForCachedMessage(
  guildId: string,
  channelId: string,
  authorId: string,
  entryTimestamp: number,
): Promise<CachedDeletedMessage | undefined> {
  const deadline = Date.now() + CACHE_WAIT_MS;

  while (Date.now() <= deadline) {
    const match = takeCachedMessage(
      guildId,
      channelId,
      authorId,
      entryTimestamp,
    );

    if (match) return match;

    await delay(CACHE_POLL_MS);
  }

  return undefined;
}

function isDuplicateEntry(entryId: string): boolean {
  const now = Date.now();

  for (const [id, timestamp] of loggedEntries) {
    if (now - timestamp > 5 * 60 * 1000) loggedEntries.delete(id);
  }

  if (loggedEntries.has(entryId)) return true;

  loggedEntries.set(entryId, now);
  return false;
}

function formatContent(content: string): string {
  const trimmed = content.trim();

  if (!trimmed) return "*(sin texto)*";

  const safeContent = trimmed.replace(/```/g, "`\u200b``");
  const truncated =
    safeContent.length > MAX_CONTENT_LENGTH
      ? `${safeContent.slice(0, MAX_CONTENT_LENGTH)}…`
      : safeContent;

  return `\`\`\`\n${truncated}\n\`\`\``;
}

function formatAttachments(
  attachments: CachedDeletedMessage["attachments"],
): string {
  const formatted = attachments
    .map((attachment) => `[${attachment.name}](${attachment.url})`)
    .join("\n");

  return formatted.length > MAX_CONTENT_LENGTH
    ? `${formatted.slice(0, MAX_CONTENT_LENGTH)}…`
    : formatted;
}

export async function logStaffMessageDelete(
  entry: GuildAuditLogsEntry<AuditLogEvent.MessageDelete>,
  guild: Guild,
): Promise<void> {
  const logChannelId = process.env.STAFF_LOG_CHANNEL_ID;

  if (!logChannelId) return;
  if (!entry.executorId) return;
  if (isDuplicateEntry(entry.id)) return;

  const channelId = entry.extra?.channel?.id;
  const authorId = entry.targetId;

  if (channelId === logChannelId) return;

  const executor = await guild.client.users
    .fetch(entry.executorId)
    .catch(() => null);

  if (executor?.bot) return;

  const logChannel =
    guild.channels.cache.get(logChannelId) ??
    (await guild.channels.fetch(logChannelId).catch(() => null));

  if (!(logChannel instanceof TextChannel)) return;

  const cachedMessage =
    channelId && authorId
      ? await waitForCachedMessage(
          guild.id,
          channelId,
          authorId,
          entry.createdTimestamp,
        )
      : undefined;

  const embed = new EmbedBuilder()
    .setColor(LOG_COLOR)
    .setTitle("🗑️ Mensaje eliminado")
    .addFields(
      {
        name: "Eliminado por",
        value: `<@${entry.executorId}> (\`${entry.executorId}\`)`,
        inline: true,
      },
      {
        name: "Autor",
        value: authorId ? `<@${authorId}> (\`${authorId}\`)` : "Desconocido",
        inline: true,
      },
      {
        name: "Canal",
        value: channelId ? `<#${channelId}>` : "Desconocido",
        inline: true,
      },
    )
    .setTimestamp(entry.createdAt);

  if (cachedMessage) {
    embed.addFields({
      name: "Contenido",
      value: formatContent(cachedMessage.content),
    });

    if (cachedMessage.attachments.length) {
      embed.addFields({
        name: "Adjuntos",
        value: formatAttachments(cachedMessage.attachments),
      });
    }

    if (channelId) {
      embed.addFields({
        name: "Mensaje",
        value: `[Ir al mensaje](https://discord.com/channels/${guild.id}/${channelId}/${cachedMessage.messageId})`,
      });
    }
  } else {
    embed.addFields({
      name: "Contenido",
      value: "No disponible (mensaje no cacheado)",
    });
  }

  if (entry.reason) {
    embed.addFields({ name: "Motivo", value: entry.reason });
  }

  await logChannel.send({
    embeds: [embed],
    allowedMentions: { parse: [] },
  });
}
