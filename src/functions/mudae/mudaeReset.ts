import Client from "../../interfaces/ICustomClient.js";
import { EmbedBuilder, ColorResolvable, TextChannel } from "discord.js";
import config from "../../config/config.json" with { type: "json" };
import { DB_MudaeActivity, DB_MudaeResetConfig } from "../../db/MudaeTypes.js";
import { Message } from "discord.js";

const trackedChannels = new Set<string>();
const DAY_MS = 24 * 60 * 60 * 1000;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function refreshTrackedChannels(client: Client): Promise<void> {
  try {
    const ids = await client.db.mudae.getOwnChannelIds();
    trackedChannels.clear();
    for (const id of ids) trackedChannels.add(id);
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} mudae/refreshTrackedChannels`);
  }
}

export function isTrackedChannel(channelId: string): boolean {
  return trackedChannels.has(channelId);
}

export async function trackMudaeMessage(message: Message, client: Client): Promise<void> {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!isTrackedChannel(message.channel.id)) return;
    await client.db.mudae.upsertActivity(
      message.author.id,
      message.channel.id,
      new Date(message.createdTimestamp).toISOString(),
    );
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} mudae/trackMudaeMessage`);
  }
}

export interface MudaeResetResult {
  active: DB_MudaeActivity[];
  recent: DB_MudaeActivity[];
  commands: string[];
}

export async function buildReset(
  client: Client,
  cfg: DB_MudaeResetConfig,
  now: Date = new Date(),
): Promise<MudaeResetResult> {
  const activeCutoff = new Date(now.getTime() - cfg.active_days * DAY_MS).toISOString();
  const recentCutoff = new Date(now.getTime() - cfg.interval_days * DAY_MS).toISOString();

  const [active, recent] = await Promise.all([
    client.db.mudae.getUsersAfter(cfg.channel_id, activeCutoff),
    client.db.mudae.getUsersAfter(cfg.channel_id, recentCutoff),
  ]);

  const commands = [
    `$bitesthedust ${cfg.game_name}`,
    ...active.map(u => `$restoreuser ${u.user_id} ${cfg.restore_value}`),
  ];

  return { active, recent, commands };
}

export async function sendReset(
  client: Client,
  cfg: DB_MudaeResetConfig,
  now: Date = new Date(),
): Promise<MudaeResetResult | null> {
  const { active, recent, commands } = await buildReset(client, cfg, now);
  const guild = client.guilds.cache.get(cfg.server_id);
  if (!guild) return null;

  const outputChannel = guild.channels.cache.get(cfg.output_channel_id) as TextChannel | undefined;
  if (outputChannel) {
    const nextRun = new Date(now.getTime() + cfg.interval_days * DAY_MS);
    const embed = new EmbedBuilder()
      .setTitle(`Mudae Reset — ${cfg.game_name}`)
      .setDescription(commands.map(c => `\`${c}\``).join("\n"))
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .addFields(
        { name: "Canal", value: `<#${cfg.channel_id}>`, inline: true },
        { name: `Usuarios (${cfg.interval_days}d)`, value: `${recent.length}`, inline: true },
        { name: `Activos (últimos ${cfg.active_days}d)`, value: `${active.length}`, inline: true },
        { name: "Próximo reset", value: `<t:${Math.floor(nextRun.getTime() / 1000)}:F>` },
      )
      .setFooter({ text: "Activo = escribió en la última semana del ciclo" })
      .setTimestamp(now);

    try {
      await outputChannel.send({ embeds: [embed] });
    } catch (err) {
      client.errorLogger(err, client, "warn", `${process.cwd()} mudae/sendReset`);
    }
  }

  if (cfg.auto_send) {
    const channel = guild.channels.cache.get(cfg.channel_id) as TextChannel | undefined;
    if (channel?.isSendable()) {
      for (const cmd of commands) {
        try {
          await channel.send(cmd);
        } catch (err) {
          client.errorLogger(err, client, "warn", `${process.cwd()} mudae/sendReset/auto`);
          break;
        }
        await delay(1000);
      }
    }
  }

  await client.db.mudae.update(cfg.server_id, { last_run_at: now.toISOString() });
  await refreshTrackedChannels(client);
  return { active, recent, commands };
}
