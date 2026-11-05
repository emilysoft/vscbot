import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import config from "../../config/config.json" with { type: "json" };
import type Client from "../../interfaces/ICustomClient.js";
import {
  backupDirectory,
  backupServerMedia,
  type BackupManifest,
  type BackupSummary,
} from "../backup/serverMediaBackup.js";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_FAILURES_IN_EMBED = 10;
const MANIFEST_NAME = "manifest.json";

let running = false;

function intervalMs(): number {
  const days = Math.max(config.backups.emojisStickers.intervalDays, 1);
  return days * 24 * 60 * 60 * 1000;
}

async function lastBackupAt(): Promise<Date | null> {
  try {
    const raw = await readFile(join(backupDirectory(), MANIFEST_NAME), "utf8");
    const manifest = JSON.parse(raw) as Partial<BackupManifest>;
    if (!manifest.createdAt) return null;

    const date = new Date(manifest.createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

async function isBackupDue(): Promise<boolean> {
  const last = await lastBackupAt();
  if (!last) return true;
  return Date.now() - last.getTime() >= intervalMs();
}

async function logChannel(client: Client): Promise<TextChannel | null> {
  const channelId = config.channels.staffLog;
  const channel =
    client.channels.cache.get(channelId) ??
    (await client.channels.fetch(channelId).catch(() => null));

  return channel instanceof TextChannel ? channel : null;
}

async function sendEmbed(client: Client, embed: EmbedBuilder): Promise<void> {
  try {
    const channel = await logChannel(client);
    if (!channel) return;
    await channel.send({ embeds: [embed] });
  } catch (err) {
    client.errorLogger(
      err,
      client,
      "error",
      `${process.cwd()} timers/mediaBackupScheduler`,
    );
  }
}

function successEmbed(summary: BackupSummary): EmbedBuilder {
  const timestamp = Math.floor(new Date(summary.createdAt).getTime() / 1000);
  const hasFailures = summary.failures.length > 0;

  const embed = new EmbedBuilder()
    .setColor((hasFailures ? "#FFAA00" : config.embedColor) as ColorResolvable)
    .setTitle(
      hasFailures
        ? "⚠️ Backup de emojis y stickers completado con fallos"
        : "💾 Backup de emojis y stickers completado",
    )
    .addFields(
      { name: "Emojis", value: `${summary.emojis}`, inline: true },
      { name: "Stickers", value: `${summary.stickers}`, inline: true },
      { name: "Fallos", value: `${summary.failures.length}`, inline: true },
      { name: "Carpeta", value: `\`${summary.directory}\`` },
      {
        name: "Generado",
        value: `<t:${timestamp}:F> (<t:${timestamp}:R>)`,
      },
    )
    .setTimestamp();

  if (hasFailures) {
    const lines = summary.failures
      .slice(0, MAX_FAILURES_IN_EMBED)
      .map(
        (failure) =>
          `• ${failure.kind} \`${failure.name}\` (${failure.id}): ${failure.error}`,
      );
    const extra =
      summary.failures.length > MAX_FAILURES_IN_EMBED
        ? `\n… y ${summary.failures.length - MAX_FAILURES_IN_EMBED} más.`
        : "";

    embed.addFields({
      name: "Detalle de fallos",
      value: `${lines.join("\n")}${extra}`.slice(0, 1024),
    });
  }

  return embed;
}

function failureEmbed(err: unknown): EmbedBuilder {
  const message = err instanceof Error ? err.message : String(err);

  return new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("❌ Backup de emojis y stickers falló")
    .setDescription(`\`\`\`\n${message.slice(0, 1500)}\n\`\`\``)
    .setTimestamp();
}

async function runBackup(client: Client): Promise<void> {
  if (running) return;
  running = true;

  try {
    const summary = await backupServerMedia(client);
    console.log(
      `[mediaBackupScheduler] Backup completado en ${summary.directory}: ` +
        `${summary.emojis} emojis, ${summary.stickers} stickers, ` +
        `${summary.failures.length} fallos.`,
    );
    await sendEmbed(client, successEmbed(summary));
  } catch (err) {
    console.error("[mediaBackupScheduler] Error al generar el backup:", err);
    client.errorLogger(
      err,
      client,
      "error",
      `${process.cwd()} timers/mediaBackupScheduler`,
    );
    await sendEmbed(client, failureEmbed(err));
  } finally {
    running = false;
  }
}

export async function initMediaBackupScheduler(client: Client): Promise<void> {
  if (!config.backups.emojisStickers.enabled) {
    console.log("[mediaBackupScheduler] Deshabilitado en config.json.");
    return;
  }

  setInterval(async () => {
    if (await isBackupDue()) await runBackup(client);
  }, CHECK_INTERVAL_MS);

  if (await isBackupDue()) {
    console.log(
      "[mediaBackupScheduler] No hay backup vigente; generando ahora.",
    );
    await runBackup(client);
  } else {
    console.log(
      "[mediaBackupScheduler] Backup vigente; próximo chequeo en 24 h.",
    );
  }
}
