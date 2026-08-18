import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  ColorResolvable,
  PermissionFlagsBits,
} from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with { type: "json" };
import { DB_MudaeResetConfig } from "../../db/MudaeTypes.js";
import { buildReset, sendReset, refreshTrackedChannels } from "../../functions/mudae/mudaeReset.js";

const DAY_MS = 24 * 60 * 60 * 1000;

async function getOrCreateConfig(
  client: Client,
  guildId: string,
  channelId: string,
): Promise<DB_MudaeResetConfig> {
  const existing = await client.db.mudae.getConfig(guildId);
  return {
    server_id: guildId,
    channel_id: channelId,
    output_channel_id: existing?.output_channel_id ?? channelId,
    game_name: existing?.game_name ?? "requiem",
    restore_value: existing?.restore_value ?? 1,
    interval_days: existing?.interval_days ?? 15,
    active_days: existing?.active_days ?? 7,
    auto_send: existing?.auto_send ?? 0,
    enabled: existing?.enabled ?? 1,
    last_run_at: existing?.last_run_at ?? new Date().toISOString(),
    created_at: existing?.created_at ?? new Date().toISOString(),
  };
}

const module: ICommand = {
  name: "mudae",
  description: "Sistema de reset de Mudae por actividad",
  slashCommand: true,
  cooldown: 5,
  allowEdited: false,
  messageCommand: false,
  data: new SlashCommandBuilder()
    .setName("mudae")
    .setDescription("Sistema de reset de Mudae por actividad")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub
      .setName("setup")
      .setDescription("Configurar el canal de Mudae y el reset automático")
      .addChannelOption(opt => opt
        .setName("canal")
        .setDescription("Canal donde se juega Mudae")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
      .addChannelOption(opt => opt
        .setName("salida")
        .setDescription("Canal donde se envía el embed con el reporte (default: el canal)")
        .addChannelTypes(ChannelType.GuildText))
      .addStringOption(opt => opt
        .setName("juego")
        .setDescription("Nombre del juego para $bitesthedust (default: requiem)"))
      .addIntegerOption(opt => opt
        .setName("restaurar")
        .setDescription("Valor de $restoreuser (default: 1)"))
      .addIntegerOption(opt => opt
        .setName("intervalo")
        .setDescription("Días entre resets (default: 15)"))
      .addIntegerOption(opt => opt
        .setName("activos")
        .setDescription("Días de la ventana activa (default: 7, la última semana)"))
      .addBooleanOption(opt => opt
        .setName("auto")
        .setDescription("Enviar los comandos al hilo automáticamente para que Mudae los ejecute")))
    .addSubcommand(sub => sub
      .setName("run")
      .setDescription("Ejecutar manualmente el reset de Mudae ahora"))
    .addSubcommand(sub => sub
      .setName("status")
      .setDescription("Ver configuración y usuarios activos actuales"))
    .addSubcommand(sub => sub
      .setName("enable")
      .setDescription("Activar el reset automático"))
    .addSubcommand(sub => sub
      .setName("disable")
      .setDescription("Pausar el reset automático"))
    .addSubcommand(sub => sub
      .setName("remove")
      .setDescription("Eliminar la configuración y el tracking de actividad")),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({ content: "Este comando solo funciona en un servidor.", ephemeral: true });
        return;
      }

      switch (subcommand) {
        case "setup": await handleSetup(interaction, client); break;
        case "run": await handleRun(interaction, client); break;
        case "status": await handleStatus(interaction, client); break;
        case "enable": await handleEnable(interaction, client, true); break;
        case "disable": await handleEnable(interaction, client, false); break;
        case "remove": await handleRemove(interaction, client); break;
      }
    } catch (err) {
      console.error("[mudae] execute error:", err);
      client.errorLogger(err, client, "error", `${process.cwd()} commands/utility/mudae`);
      try {
        if (!interaction.replied) await interaction.reply({ content: "Ocurrió un error al ejecutar el comando.", ephemeral: true });
        else await interaction.editReply({ content: "Ocurrió un error al ejecutar el comando." }).catch(() => {});
      } catch { /* noop */ }
    }
  },
};

async function handleSetup(interaction: ChatInputCommandInteraction, client: Client) {
  const channel = interaction.options.getChannel("canal", true);
  const output = interaction.options.getChannel("salida") || channel;
  const guildId = interaction.guildId!;

  const cfg = await getOrCreateConfig(client, guildId, channel.id);

  const gameName = interaction.options.getString("juego") ?? cfg.game_name;
  const restoreValue = interaction.options.getInteger("restaurar") ?? cfg.restore_value;
  const intervalDays = interaction.options.getInteger("intervalo") ?? cfg.interval_days;
  const activeDays = interaction.options.getInteger("activos") ?? cfg.active_days;
  const autoSend = interaction.options.getBoolean("auto") ?? cfg.auto_send === 1;

  if (intervalDays < 1 || activeDays < 1 || activeDays > intervalDays) {
    await interaction.reply({
      content: "❌ `activos` debe estar entre 1 e `intervalo`. `intervalo` debe ser ≥ 1.",
      ephemeral: true,
    });
    return;
  }

  await client.db.mudae.upsertConfig({
    ...cfg,
    channel_id: channel.id,
    output_channel_id: output.id,
    game_name: gameName,
    restore_value: restoreValue,
    interval_days: intervalDays,
    active_days: activeDays,
    auto_send: autoSend ? 1 : 0,
    enabled: cfg.enabled ?? 1,
  });

  await refreshTrackedChannels(client);

  const embed = new EmbedBuilder()
    .setTitle("✅ Mudae reset configurado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "Canal", value: `<#${channel.id}>`, inline: true },
      { name: "Salida", value: `<#${output.id}>`, inline: true },
      { name: "Juego", value: gameName, inline: true },
      { name: "Restaurar", value: `${restoreValue}`, inline: true },
      { name: "Intervalo", value: `${intervalDays} días`, inline: true },
      { name: "Activos", value: `últimos ${activeDays} días`, inline: true },
      { name: "Auto-enviar", value: autoSend ? "✅ Sí" : "❌ No", inline: true },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleRun(interaction: ChatInputCommandInteraction, client: Client) {
  const guildId = interaction.guildId!;
  const cfg = await client.db.mudae.getConfig(guildId);
  if (!cfg || !cfg.enabled) {
    await interaction.reply({ content: "❌ No hay configuración activa. Usa `/mudae setup`.", ephemeral: true });
    return;
  }

  const result = await sendReset(client, cfg);
  if (!result) {
    await interaction.reply({ content: "❌ No se pudo ejecutar el reset: servidor no encontrado.", ephemeral: true });
    return;
  }
  const { active, recent, commands } = result;

  const embed = new EmbedBuilder()
    .setTitle("Reset ejecutado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .setDescription(active.length
      ? active.map(u => `\`$restoreuser ${u.user_id} ${cfg.restore_value}\``).join("\n")
      : "Ningún usuario activo en la ventana.")
    .addFields(
      { name: `Activos (últimos ${cfg.active_days}d)`, value: `${active.length}`, inline: true },
      { name: `Usuarios (${cfg.interval_days}d)`, value: `${recent.length}`, inline: true },
    )
    .setFooter({ text: commands.length > 1 ? `Incluye: $bitesthedust ${cfg.game_name}` : "" });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleStatus(interaction: ChatInputCommandInteraction, client: Client) {
  const guildId = interaction.guildId!;
  const cfg = await client.db.mudae.getConfig(guildId);
  if (!cfg) {
    await interaction.reply({ content: "No hay configuración. Usa `/mudae setup`.", ephemeral: true });
    return;
  }

  const now = new Date();
  const { active, recent } = await buildReset(client, cfg, now);
  const nextRun = cfg.last_run_at
    ? new Date(new Date(cfg.last_run_at).getTime() + cfg.interval_days * DAY_MS)
    : now;

  const embed = new EmbedBuilder()
    .setTitle("Estado del reset de Mudae")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "Canal", value: `<#${cfg.channel_id}>`, inline: true },
      { name: "Salida", value: `<#${cfg.output_channel_id}>`, inline: true },
      { name: "Juego", value: cfg.game_name, inline: true },
      { name: "Intervalo", value: `${cfg.interval_days} días`, inline: true },
      { name: "Ventana activa", value: `${cfg.active_days} días`, inline: true },
      { name: "Auto-enviar", value: cfg.auto_send ? "✅" : "❌", inline: true },
      { name: "Estado", value: cfg.enabled ? "🟢 Activo" : "⏸️ Pausado", inline: true },
      { name: "Próximo reset", value: `<t:${Math.floor(nextRun.getTime() / 1000)}:F>` },
      { name: `Usuarios (${cfg.interval_days}d)`, value: `${recent.length}`, inline: true },
      { name: `Activos (últimos ${cfg.active_days}d)`, value: `${active.length}`, inline: true },
    );

  if (active.length > 0) {
    embed.addFields({
      name: "IDs activos",
      value: active.map(u => `\`${u.user_id}\``).join("\n").slice(0, 1024),
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleEnable(interaction: ChatInputCommandInteraction, client: Client, enabled: boolean) {
  const guildId = interaction.guildId!;
  const cfg = await client.db.mudae.getConfig(guildId);
  if (!cfg) {
    await interaction.reply({ content: "No hay configuración. Usa `/mudae setup`.", ephemeral: true });
    return;
  }
  await client.db.mudae.update(guildId, { enabled: enabled ? 1 : 0 });
  await refreshTrackedChannels(client);
  await interaction.reply({
    content: enabled ? "✅ Reset automático activado." : "⏸️ Reset automático pausado.",
    ephemeral: true,
  });
}

async function handleRemove(interaction: ChatInputCommandInteraction, client: Client) {
  const guildId = interaction.guildId!;
  await client.db.mudae.delete(guildId);
  await refreshTrackedChannels(client);
  await interaction.reply({ content: "❌ Configuración y tracking de Mudae eliminados.", ephemeral: true });
}

export default module;