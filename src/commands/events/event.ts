import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  TextChannel,
  Guild,
  ColorResolvable,
  PermissionFlagsBits,
} from "discord.js";
import { DateTime } from "luxon";
import Client from "../../interfaces/ICustomClient.js";
import ICommand from "../../interfaces/command.js";
import config from "../../config/config.json" with { type: "json" };
import {
  startEvent,
  endEvent,
  createDiscordEvent,
  createPrivateVoiceChannel,
  fetchImageAsBase64,
} from "../../functions/scheduledEvents/eventManager.js";
import { rescheduleEvent, cancelScheduledEvent } from "../../functions/timers/eventScheduler.js";
import { DB_ScheduledEvent } from "../../db/EventTypes.js";

const RECURRENCE_CHOICES = [
  { name: "No recurrente", value: "none" },
  { name: "Diario", value: "daily" },
  { name: "Semanal", value: "weekly" },
  { name: "Quincenal", value: "biweekly" },
  { name: "Mensual", value: "monthly" },
];

const CHANNEL_BEHAVIOR_CHOICES = [
  { name: "Eliminar canales", value: "delete" },
  { name: "Archivar canales", value: "archive" },
];

const FILTER_CHOICES = [
  { name: "Próximos", value: "upcoming" },
  { name: "Pasados", value: "past" },
  { name: "Todos", value: "all" },
];

function addEventOptions(sub: SlashCommandSubcommandBuilder, required: boolean) {
  return sub
    .addStringOption(opt => opt.setName("name").setDescription("Nombre del evento").setRequired(required).setMaxLength(100))
    .addStringOption(opt => opt.setName("start_time").setDescription("Fecha y hora (YYYY-MM-DD HH:MM)").setRequired(required))
    .addRoleOption(opt => opt.setName("role").setDescription("Rol para ping").setRequired(required))
    .addStringOption(opt => opt.setName("end_time").setDescription("Fecha y hora de fin (YYYY-MM-DD HH:MM)"))
    .addStringOption(opt => opt.setName("channel_behavior").setDescription("Qué hacer con los canales al terminar").addChoices(...CHANNEL_BEHAVIOR_CHOICES))
    .addNumberOption(opt => opt.setName("retention_hours").setDescription("Horas antes de archivar/eliminar el canal de texto (0 = inmediato)"))
    .addStringOption(opt => opt.setName("recurrence").setDescription("Recurrencia").addChoices(...RECURRENCE_CHOICES))
    .addStringOption(opt => opt.setName("description").setDescription("Descripción del evento").setMaxLength(500))
    .addStringOption(opt => opt.setName("message").setDescription("Mensaje personalizado de inicio").setMaxLength(500))
    .addStringOption(opt => opt.setName("activities").setDescription("Actividades separadas por coma"))
    .addStringOption(opt => opt.setName("text_channel_name").setDescription("Nombre personalizado del canal de texto").setMaxLength(32))
    .addStringOption(opt => opt.setName("voice_channel_name").setDescription("Nombre personalizado del canal de voz").setMaxLength(32))
    .addStringOption(opt => opt.setName("channel_topic").setDescription("Topic personalizado del canal de texto").setMaxLength(500))
    .addStringOption(opt => opt.setName("image_url").setDescription("URL de imagen para el evento de Discord y mensaje de inicio"))
    .addBooleanOption(opt => opt.setName("require_confirmation").setDescription("Exigir confirmación 2h antes (usar config del server si no se especifica)"));
}

const module: ICommand = {
  name: "event",
  description: "Gestiona eventos programados",
  slashCommand: true,
  cooldown: 2,
  allowEdited: false,
  messageCommand: false,
  data: new SlashCommandBuilder()
    .setName("event")
    .setDescription("Gestiona eventos programados")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub
      .setName("settings")
      .setDescription("Ver configuración del sistema de eventos"))
    .addSubcommand(sub => sub
      .setName("setup")
      .setDescription("Configurar el sistema de eventos")
      .addBooleanOption(opt => opt.setName("enabled").setDescription("Activar/desactivar el módulo de eventos"))
      .addRoleOption(opt => opt.setName("role").setDescription("Rol por defecto para ping en eventos"))
      .addChannelOption(opt => opt.setName("events_channel").setDescription("Canal #eventos para invites de Discord"))
      .addChannelOption(opt => opt.setName("logs_channel").setDescription("Canal #event-logs para resúmenes"))
      .addChannelOption(opt => opt.setName("voice_category").setDescription("Categoría para crear canales de voz"))
      .addChannelOption(opt => opt.setName("text_category").setDescription("Categoría para crear canales de texto"))
      .addChannelOption(opt => opt.setName("archive_category").setDescription("Categoría para archivar canales"))
      .addBooleanOption(opt => opt.setName("discord_events").setDescription("Usar eventos de Discord"))
      .addBooleanOption(opt => opt.setName("require_confirmation").setDescription("Exigir confirmación 2h antes del evento"))
      .addBooleanOption(opt => opt.setName("mention_role_on_start").setDescription("Mencionar rol al iniciar el evento").setRequired(true)))
    .addSubcommand(sub => addEventOptions(sub
      .setName("create")
      .setDescription("Crear un nuevo evento programado"), true))
    .addSubcommand(sub => addEventOptions(sub
      .setName("test")
      .setDescription("Crear un evento de prueba"), false))
    .addSubcommand(sub => sub
      .setName("list")
      .setDescription("Listar eventos")
      .addStringOption(opt => opt.setName("filter").setDescription("Filtro").addChoices(...FILTER_CHOICES)))
    .addSubcommand(sub => sub
      .setName("edit")
      .setDescription("Editar un evento")
      .addNumberOption(opt => opt.setName("id").setDescription("ID del evento").setRequired(true).setAutocomplete(true))
      .addStringOption(opt => opt.setName("name").setDescription("Nuevo nombre").setMaxLength(100))
      .addStringOption(opt => opt.setName("start_time").setDescription("Nueva fecha y hora (YYYY-MM-DD HH:MM)"))
      .addStringOption(opt => opt.setName("end_time").setDescription("Nueva fecha y hora de fin"))
      .addStringOption(opt => opt.setName("channel_behavior").setDescription("Comportamiento de canales al terminar").addChoices(...CHANNEL_BEHAVIOR_CHOICES))
      .addNumberOption(opt => opt.setName("retention_hours").setDescription("Horas de retención del canal de texto"))
      .addStringOption(opt => opt.setName("recurrence").setDescription("Recurrencia").addChoices(...RECURRENCE_CHOICES))
      .addStringOption(opt => opt.setName("description").setDescription("Nueva descripción").setMaxLength(500))
      .addRoleOption(opt => opt.setName("role").setDescription("Nuevo rol para ping"))
      .addStringOption(opt => opt.setName("message").setDescription("Nuevo mensaje personalizado").setMaxLength(500))
      .addStringOption(opt => opt.setName("activities").setDescription("Nuevas actividades separadas por coma"))
      .addStringOption(opt => opt.setName("text_channel_name").setDescription("Nuevo nombre del canal de texto").setMaxLength(32))
      .addStringOption(opt => opt.setName("voice_channel_name").setDescription("Nuevo nombre del canal de voz").setMaxLength(32))
      .addStringOption(opt => opt.setName("channel_topic").setDescription("Nuevo topic del canal de texto").setMaxLength(500))
      .addStringOption(opt => opt.setName("image_url").setDescription("Nueva URL de imagen"))
      .addBooleanOption(opt => opt.setName("require_confirmation").setDescription("Exigir confirmación 2h antes (usar config del server si no se especifica)")))
    .addSubcommand(sub => sub
      .setName("delete")
      .setDescription("Cancelar un evento")
      .addNumberOption(opt => opt.setName("id").setDescription("ID del evento").setRequired(true).setAutocomplete(true)))
    .addSubcommand(sub => sub
      .setName("start")
      .setDescription("Forzar inicio de un evento")
      .addNumberOption(opt => opt.setName("id").setDescription("ID del evento").setRequired(true).setAutocomplete(true)))
    .addSubcommand(sub => sub
      .setName("end")
      .setDescription("Forzar fin de un evento")
      .addNumberOption(opt => opt.setName("id").setDescription("ID del evento").setRequired(true).setAutocomplete(true)))
    .addSubcommand(sub => sub
      .setName("info")
      .setDescription("Ver detalles de un evento")
      .addNumberOption(opt => opt.setName("id").setDescription("ID del evento").setRequired(true).setAutocomplete(true))),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const guildId = interaction.guildId;
    if (!guildId) return;

    const client = interaction.client as Client;
    const events = await client.db.events.getEventsByGuild(guildId);
    const query = String(focusedValue).toLowerCase();
    const filtered = events
      .filter(e => e.status === 'scheduled' || e.status === 'active')
      .filter(e => e.name.toLowerCase().includes(query) || String(e.id).includes(query))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(e => ({ name: `#${e.id} - ${e.name}`, value: e.id! }))
    );
  },

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({ content: "Este comando solo funciona en un servidor.", ephemeral: true });
        return;
      }

      switch (subcommand) {
        case "settings": await handleSettings(interaction, client, guild); break;
        case "setup": await handleSetup(interaction, client, guild); break;
        case "create": await handleCreate(interaction, client, guild); break;
        case "list": await handleList(interaction, client, guild); break;
        case "edit": await handleEdit(interaction, client, guild); break;
        case "delete": await handleDelete(interaction, client); break;
        case "start": await handleForceStart(interaction, client); break;
        case "end": await handleForceEnd(interaction, client); break;
        case "info": await handleInfo(interaction, client); break;
        case "test": await handleTest(interaction, client, guild); break;
      }
    } catch (err) {
      console.error("[event] execute error:", err);
      client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
      try {
        if (!interaction.replied) await interaction.reply({ content: "Ocurrió un error al ejecutar el comando.", ephemeral: true });
      else await interaction.editReply({ content: "Ocurrió un error al ejecutar el comando." }).catch(() => {});
      } catch { }
    }
  },
};

async function handleSettings(interaction: ChatInputCommandInteraction, client: Client, guild: Guild) {
  try {
    console.log("[event] handleSettings called for guild:", guild.id);
    const config_ = await client.db.events.initConfig(guild.id);
    console.log("[event] config loaded:", JSON.stringify(config_));
    const enabled = config_.enabled ? "✅ Activado" : "❌ Desactivado";

  const embed = new EmbedBuilder()
    .setTitle("Configuración de Eventos")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "Estado", value: enabled, inline: true },
      { name: "Rol por defecto", value: config_.default_role_id ? `<@&${config_.default_role_id}>` : "No configurado", inline: true },
      { name: "Canal de eventos", value: config_.events_channel ? `<#${config_.events_channel}>` : "No configurado", inline: true },
      { name: "Canal de logs", value: config_.logs_channel ? `<#${config_.logs_channel}>` : "No configurado", inline: true },
      { name: "Categoría voz", value: config_.voice_category ? `<#${config_.voice_category}>` : "No configurado", inline: true },
      { name: "Categoría texto", value: config_.text_category ? `<#${config_.text_category}>` : "No configurado", inline: true },
      { name: "Categoría archivo", value: config_.archive_category ? `<#${config_.archive_category}>` : "No configurado", inline: true },
      { name: "Eventos de Discord", value: config_.use_discord_events ? "✅ Usar" : "❌ No usar", inline: true },
      { name: "Confirmación previa", value: config_.require_confirmation ? "✅ Exigir" : "❌ No exigir", inline: true },
    )
    .setFooter({ text: "Usa /event create para crear un evento" });

  await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (err) {
    console.error("[event] handleSettings error:", err);
    client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
    try {
      if (!interaction.replied) await interaction.reply({ content: "Error al cargar configuración.", ephemeral: true });
    } catch { }
  }
}

async function handleSetup(interaction: ChatInputCommandInteraction, client: Client, guild: Guild) {
  try {
    const existing = await client.db.events.initConfig(guild.id);
    const updates: Record<string, any> = {};

    const enabled = interaction.options.getBoolean("enabled");
    const role = interaction.options.getRole("role");
    const eventsChannel = interaction.options.getChannel("events_channel");
    const logsChannel = interaction.options.getChannel("logs_channel");
    const voiceCategory = interaction.options.getChannel("voice_category");
    const textCategory = interaction.options.getChannel("text_category");
    const archiveCategory = interaction.options.getChannel("archive_category");
    const discordEvents = interaction.options.getBoolean("discord_events");
    const requireConfirmation = interaction.options.getBoolean("require_confirmation");
    const mentionRoleOnStart = interaction.options.getBoolean("mention_role_on_start", true);

    if (enabled !== null) updates.enabled = enabled ? 1 : 0;
    if (role) updates.default_role_id = role.id;
    if (eventsChannel) updates.events_channel = eventsChannel.id;
    if (logsChannel) updates.logs_channel = logsChannel.id;
    if (voiceCategory) updates.voice_category = voiceCategory.id;
    if (textCategory) updates.text_category = textCategory.id;
    if (archiveCategory) updates.archive_category = archiveCategory.id;
    if (discordEvents !== null) updates.use_discord_events = discordEvents ? 1 : 0;
    if (requireConfirmation !== null) updates.require_confirmation = requireConfirmation ? 1 : 0;
    if (mentionRoleOnStart !== null) updates.mention_role_on_start = mentionRoleOnStart ? 1 : 0;

    if (Object.keys(updates).length === 0) {
      await interaction.reply({ content: "No especificaste ninguna opción para cambiar. Usa `/event settings` para ver la configuración actual.", ephemeral: true });
      return;
    }

    const merged = { ...existing, ...updates, server_id: guild.id, created_at: existing.created_at };
    await client.db.events.upsertConfig(merged);

    const changed = Object.keys(updates).map(k => {
      const v = updates[k];
      if (k === 'default_role_id') return `role: <@&${v}>`;
      if (k.endsWith('_channel') || k.endsWith('_category')) return `${k}: <#${v}>`;
      if (k === 'enabled') return `enabled: ${v ? '✅' : '❌'}`;
      if (k === 'use_discord_events') return `discord_events: ${v ? '✅' : '❌'}`;
      return `${k}: ${v}`;
    }).join('\n');

    await interaction.reply({ content: `✅ Configuración actualizada:\n${changed}`, ephemeral: true });
  } catch (err) {
    console.error("[event] handleSetup error:", err);
    client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
    try {
      if (!interaction.replied) await interaction.reply({ content: "Error al actualizar configuración.", ephemeral: true });
    } catch { }
  }
}

async function createEventCore(
  client: Client,
  guild: Guild,
  params: {
    name: string;
    startTime: DateTime;
    endTime: DateTime | null;
    channelBehavior: string;
    retentionHours: number;
    recurrence: string;
    description: string;
    roleId: string | null;
    message: string;
    activities: string[];
    textChannelName: string | null;
    voiceChannelName: string | null;
    channelTopic: string | null;
    imageUrl: string | null;
    requireConfirmation: boolean | null;
    createdBy: string;
  },
): Promise<DB_ScheduledEvent> {
  const eventConfig = await client.db.events.initConfig(guild.id);

  let voiceChannelId: string | null = null;
  if (eventConfig.enabled) {
    voiceChannelId = await createPrivateVoiceChannel(guild, params.name, eventConfig, params.voiceChannelName);
  }

  let discordEventId: string | null = null;
  if (eventConfig.use_discord_events) {
    const discordId = await createDiscordEvent(guild, {
      name: params.name,
      startTime: params.startTime.toISO()!,
      endTime: params.endTime?.toISO() || null,
      description: params.description,
      imageUrl: params.imageUrl,
    }, voiceChannelId || undefined);

    if (!discordId && voiceChannelId) {
      try {
        const vc = guild.channels.cache.get(voiceChannelId);
        if (vc) await vc.delete();
      } catch { /* already deleted */ }
      voiceChannelId = null;
    }

    if (discordId) {
      discordEventId = discordId;
      if (eventConfig.events_channel) {
        const eventsChannel = guild.channels.cache.get(eventConfig.events_channel) as TextChannel | undefined;
        if (eventsChannel) {
          const serverRoleMention = eventConfig.default_role_id
            ? `<@&${eventConfig.default_role_id}>`
            : '';
          await eventsChannel.send(`📅 **${params.name}** — ${params.startTime.toLocaleString(DateTime.DATETIME_MED)}\nhttps://discord.com/events/${guild.id}/${discordId}\n${serverRoleMention}`);
        }
      }
    }
  }

  const event = await client.db.events.createEvent({
    server_id: guild.id,
    name: params.name,
    description: params.description,
    role_id: params.roleId,
    channel_id: null,
    custom_message: params.message || null,
    use_discord_event: eventConfig.use_discord_events ? 1 : 0,
    start_time: params.startTime.toISO()!,
    end_time: params.endTime?.toISO() || null,
    recurrence: params.recurrence,
    activities: JSON.stringify(params.activities),
    channel_behavior: params.channelBehavior,
    retention_hours: params.retentionHours,
    status: 'scheduled',
    created_by: params.createdBy,
    text_channel_name: params.textChannelName,
    channel_topic: params.channelTopic,
    voice_channel_name: params.voiceChannelName,
    image_url: params.imageUrl,
    require_confirmation: params.requireConfirmation ? 1 : (params.requireConfirmation === false ? 0 : null),
    voice_channel_id: voiceChannelId,
    text_channel_id: null,
    message_id: null,
    discord_event_id: discordEventId,
    reminder_sent: 0,
  });

  if (params.activities.length > 0) {
    for (const activityName of params.activities) {
      await client.db.events.addActivity({
        event_id: event.id!,
        name: activityName,
        success_count: 0,
        total_count: 0,
      });
    }
  }

  await rescheduleEvent(client, event.id!);

  return event;
}

async function handleCreate(interaction: ChatInputCommandInteraction, client: Client, guild: Guild) {
  await interaction.deferReply({ ephemeral: true });

  const name = interaction.options.getString("name", true);
  const startTimeStr = interaction.options.getString("start_time", true);
  const endTimeStr = interaction.options.getString("end_time");
  const channelBehavior = interaction.options.getString("channel_behavior") || "delete";
  const retentionHours = interaction.options.getNumber("retention_hours") || 0;
  const recurrence = interaction.options.getString("recurrence") || "none";
  const description = interaction.options.getString("description") || "";
  const role = interaction.options.getRole("role");
  const message = interaction.options.getString("message") || "";
  const activitiesStr = interaction.options.getString("activities");
  const textChannelName = interaction.options.getString("text_channel_name");
  const voiceChannelName = interaction.options.getString("voice_channel_name");
  const channelTopic = interaction.options.getString("channel_topic");
  const imageUrl = interaction.options.getString("image_url");

  const startTime = DateTime.fromFormat(startTimeStr, "yyyy-MM-dd HH:mm");
  if (!startTime.isValid) {
    return void interaction.editReply({ content: `Fecha inválida: "${startTimeStr}". Usa el formato YYYY-MM-DD HH:MM (ej: 2026-06-10 20:00)` });
  }

  let endTime: DateTime | null = null;
  if (endTimeStr) {
    endTime = DateTime.fromFormat(endTimeStr, "yyyy-MM-dd HH:mm");
    if (!endTime.isValid) {
      return void interaction.editReply({ content: `Fecha de fin inválida: "${endTimeStr}". Usa el formato YYYY-MM-DD HH:MM` });
    }
    if (endTime <= startTime) {
      return void interaction.editReply({ content: "La fecha de fin debe ser posterior a la de inicio." });
    }
  }

  const activities = activitiesStr
    ? activitiesStr.split(",").map(a => a.trim()).filter(Boolean)
    : [];

  const event = await createEventCore(client, guild, {
    name,
    startTime,
    endTime,
    channelBehavior,
    retentionHours,
    recurrence,
    description,
    roleId: role?.id || null,
    message,
    activities,
    textChannelName: textChannelName || null,
    voiceChannelName: voiceChannelName || null,
    channelTopic: channelTopic || null,
    imageUrl: imageUrl || null,
    requireConfirmation: interaction.options.getBoolean("require_confirmation"),
    createdBy: interaction.user.id,
  });

  const embed = new EmbedBuilder()
    .setTitle("✅ Evento creado")
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "Nombre", value: name, inline: true },
      { name: "ID", value: `#${event.id}`, inline: true },
      { name: "Inicio", value: startTime.toLocaleString(DateTime.DATETIME_MED), inline: true },
      { name: "Fin", value: endTime?.toLocaleString(DateTime.DATETIME_MED) || "Sin definir", inline: true },
      { name: "Recurrencia", value: recurrence === 'none' ? "No" : recurrence, inline: true },
      { name: "Comportamiento", value: channelBehavior === 'archive' ? "Archivar" : "Eliminar", inline: true },
      { name: "Retención (horas)", value: String(retentionHours), inline: true },
    );

  if (activities.length > 0) {
    embed.addFields({ name: "Actividades", value: activities.join(", ") });
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleList(interaction: ChatInputCommandInteraction, client: Client, guild: Guild) {
  const filter = interaction.options.getString("filter") || "upcoming";
  const now = new Date().toISOString();
  const events = await client.db.events.getEventsByGuild(guild.id);
  let filtered: DB_ScheduledEvent[];

  switch (filter) {
    case "upcoming":
      filtered = events.filter(e => e.status === 'scheduled' || e.status === 'active');
      break;
    case "past":
      filtered = events.filter(e => e.status === 'completed' || e.status === 'ended' || e.status === 'cancelled');
      break;
    default:
      filtered = events;
  }

  if (filtered.length === 0) {
    return void interaction.reply({ content: `No hay eventos ${filter === 'upcoming' ? 'próximos' : filter === 'past' ? 'pasados' : ''}.`, ephemeral: true });
  }

  const lines = filtered.slice(0, 25).map(e => {
    const start = new Date(e.start_time).toLocaleDateString();
    const statusEmoji = e.status === 'scheduled' ? '⏳' : e.status === 'active' ? '🟢' : e.status === 'ended' ? '🔚' : e.status === 'completed' ? '✅' : '❌';
    return `${statusEmoji} **#${e.id}** — ${e.name} (${start}) [${e.status}]`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`Eventos — ${filter === 'upcoming' ? 'Próximos' : filter === 'past' ? 'Pasados' : 'Todos'}`)
    .setDescription(lines.join('\n'))
    .setColor(config.EMBED_COLOR as ColorResolvable);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleEdit(interaction: ChatInputCommandInteraction, client: Client, guild: Guild) {
  const id = interaction.options.getNumber("id", true);
  const event = await client.db.events.getEvent(id);

  if (!event || event.server_id !== guild.id) {
    return void interaction.reply({ content: `Evento #${id} no encontrado.`, ephemeral: true });
  }

  const updates: Record<string, any> = {};
  const name = interaction.options.getString("name");
  const startTimeStr = interaction.options.getString("start_time");
  const endTimeStr = interaction.options.getString("end_time");
  const channelBehavior = interaction.options.getString("channel_behavior");
  const retentionHours = interaction.options.getNumber("retention_hours");
  const recurrence = interaction.options.getString("recurrence");
  const description = interaction.options.getString("description");
  const role = interaction.options.getRole("role");
  const message = interaction.options.getString("message");
  const activitiesStr = interaction.options.getString("activities");
  const textChannelName = interaction.options.getString("text_channel_name");
  const voiceChannelName = interaction.options.getString("voice_channel_name");
  const channelTopic = interaction.options.getString("channel_topic");
  const imageUrl = interaction.options.getString("image_url");
  const requireConfirmation = interaction.options.getBoolean("require_confirmation");

  if (name) updates.name = name;
  if (channelBehavior) updates.channel_behavior = channelBehavior;
  if (retentionHours !== null && retentionHours !== undefined) updates.retention_hours = retentionHours;
  if (recurrence) updates.recurrence = recurrence;
  if (description !== null && description !== undefined) updates.description = description;
  if (role) updates.role_id = role.id;
  if (message !== null && message !== undefined) updates.custom_message = message;
  if (textChannelName !== null && textChannelName !== undefined) updates.text_channel_name = textChannelName;
  if (voiceChannelName !== null && voiceChannelName !== undefined) updates.voice_channel_name = voiceChannelName;
  if (channelTopic !== null && channelTopic !== undefined) updates.channel_topic = channelTopic;
  if (imageUrl !== null && imageUrl !== undefined) updates.image_url = imageUrl;
  if (requireConfirmation !== null) updates.require_confirmation = requireConfirmation ? 1 : 0;

  if (startTimeStr) {
    const startTime = DateTime.fromFormat(startTimeStr, "yyyy-MM-dd HH:mm");
    if (!startTime.isValid) return void interaction.reply({ content: `Fecha inválida: "${startTimeStr}"`, ephemeral: true });
    updates.start_time = startTime.toISO()!;
  }

  if (endTimeStr) {
    const endTime = DateTime.fromFormat(endTimeStr, "yyyy-MM-dd HH:mm");
    if (!endTime.isValid) return void interaction.reply({ content: `Fecha de fin inválida: "${endTimeStr}"`, ephemeral: true });
    updates.end_time = endTime.toISO()!;
  }

  if (activitiesStr) {
    const activities = activitiesStr.split(",").map(a => a.trim()).filter(Boolean);
    updates.activities = JSON.stringify(activities);
  }

  if (Object.keys(updates).length === 0) {
    return void interaction.reply({ content: "No se especificaron cambios.", ephemeral: true });
  }

  await client.db.events.updateEvent(id, updates);
  await rescheduleEvent(client, id);

  if (event.discord_event_id && event.use_discord_event) {
    const discordEdit: Record<string, any> = {};
    if (updates.name) discordEdit.name = updates.name;
    if (updates.description !== undefined) discordEdit.description = updates.description;
    if (updates.start_time) discordEdit.scheduledStartTime = updates.start_time;
    if (updates.end_time !== undefined) discordEdit.scheduledEndTime = updates.end_time || null;
    if (updates.image_url !== undefined) {
      const b64 = await fetchImageAsBase64(updates.image_url);
      if (b64) discordEdit.image = b64;
    }
    if (Object.keys(discordEdit).length > 0) {
      try {
        const discordEvent = await guild.scheduledEvents.fetch(event.discord_event_id);
        await discordEvent.edit(discordEdit);
      } catch (err) {
        client.errorLogger(err, client, "warn", `${process.cwd()} commands/events/event`);
      }
    }
  }

  await interaction.reply({ content: `✅ Evento #${id} actualizado.`, ephemeral: true });
}

async function handleDelete(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const event = await client.db.events.getEvent(id);

  if (!event) {
    return void interaction.reply({ content: `Evento #${id} no encontrado.`, ephemeral: true });
  }

  await cancelScheduledEvent(id);

  await client.db.events.deleteEvent(id);

  const guild = interaction.guild;
  if (guild) {
    if (event.voice_channel_id) {
      try {
        const channel = guild.channels.cache.get(event.voice_channel_id);
        if (channel) await channel.delete();
      } catch (err) {
        client.errorLogger(err, client, "warn", `${process.cwd()} commands/events/event`);
      }
    }
    if (event.discord_event_id) {
      try {
        const discordEvent = await guild.scheduledEvents.fetch(event.discord_event_id);
        if (discordEvent) await discordEvent.delete();
      } catch { }
    }
  }

  await interaction.reply({ content: `❌ Evento #${id} ("${event.name}") cancelado.`, ephemeral: true });
}

async function handleForceStart(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const event = await client.db.events.getEvent(id);

  if (!event) {
    return void interaction.reply({ content: `Evento #${id} no encontrado.`, ephemeral: true });
  }

  if (event.status !== 'scheduled') {
    return void interaction.reply({ content: `El evento #${id} no está programado (estado: ${event.status}).`, ephemeral: true });
  }

  await cancelScheduledEvent(id);
  await startEvent(client, id);
  await interaction.reply({ content: `🚀 Evento #${id} ("${event.name}") iniciado.`, ephemeral: true });
}

async function handleForceEnd(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const event = await client.db.events.getEvent(id);

  if (!event) {
    return void interaction.reply({ content: `Evento #${id} no encontrado.`, ephemeral: true });
  }

  if (event.status !== 'active') {
    return void interaction.reply({ content: `El evento #${id} no está activo (estado: ${event.status}).`, ephemeral: true });
  }

  await cancelScheduledEvent(id);
  await endEvent(client, id);
  await interaction.reply({ content: `🏁 Evento #${id} ("${event.name}") finalizado.`, ephemeral: true });
}

async function handleInfo(interaction: ChatInputCommandInteraction, client: Client) {
  const id = interaction.options.getNumber("id", true);
  const event = await client.db.events.getEvent(id);

  if (!event) {
    return void interaction.reply({ content: `Evento #${id} no encontrado.`, ephemeral: true });
  }

  const participants = await client.db.events.getParticipants(id);
  const activities = await client.db.events.getActivities(id);

  const voiceParticipants = participants.filter(p => p.source === 'voice');
  const reactionParticipants = participants.filter(p => p.source === 'reaction');
  const uniqueUsers = new Set(participants.map(p => p.user_id)).size;
  const voiceUnique = new Set(voiceParticipants.map(p => p.user_id)).size;
  const reactionUnique = new Set(reactionParticipants.map(p => p.user_id)).size;

  const statusEmoji: Record<string, string> = {
    scheduled: '⏳', active: '🟢', ended: '🔚', completed: '✅', cancelled: '❌',
  };

  const startDate = new Date(event.start_time).toLocaleString();
  const endDate = event.end_time ? new Date(event.end_time).toLocaleString() : "Sin definir";

  const embed = new EmbedBuilder()
    .setTitle(`${statusEmoji[event.status] || ''} ${event.name}`)
    .setColor(config.EMBED_COLOR as ColorResolvable)
    .addFields(
      { name: "ID", value: `#${event.id}`, inline: true },
      { name: "Estado", value: event.status, inline: true },
      { name: "Inicio", value: startDate, inline: true },
      { name: "Fin", value: endDate, inline: true },
      { name: "Recurrencia", value: event.recurrence, inline: true },
      { name: "Comportamiento", value: event.channel_behavior === 'archive' ? 'Archivar' : 'Eliminar', inline: true },
      { name: "Retención (horas)", value: String(event.retention_hours), inline: true },
      { name: "Participantes (voz)", value: `${voiceUnique}`, inline: true },
      { name: "Participantes (reacción)", value: `${reactionUnique}`, inline: true },
      { name: "Total únicos", value: `${uniqueUsers}`, inline: true },
    );

  if (event.description) {
    embed.setDescription(event.description);
  }

  if (activities.length > 0) {
    const actText = activities.map(a => `${a.name}: ${a.success_count}/${a.total_count}`).join('\n');
    embed.addFields({ name: "Actividades", value: actText });
  }

  if (participants.length > 0) {
    const topParticipants = [...participants]
      .filter(p => p.duration_sec)
      .sort((a, b) => (b.duration_sec || 0) - (a.duration_sec || 0))
      .slice(0, 10);

    if (topParticipants.length > 0) {
      const leaders = await Promise.all(topParticipants.map(async p => {
        const user = await client.users.fetch(p.user_id).catch(() => null);
        const name = user?.username || p.user_id;
        const mins = Math.floor((p.duration_sec || 0) / 60);
        return `${name}: ${mins} min`;
      }));
      embed.addFields({ name: "Top participantes (tiempo)", value: leaders.join('\n') });
    }
  }

  await interaction.reply({ embeds: [embed], ephemeral: false });
}

async function handleTest(interaction: ChatInputCommandInteraction, client: Client, guild: Guild) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const now = DateTime.now();
    const name = interaction.options.getString("name") || `🧪 Test ${now.toFormat('HH:mm:ss')}`;
    const startTimeStr = interaction.options.getString("start_time");
    const endTimeStr = interaction.options.getString("end_time");
    const channelBehavior = interaction.options.getString("channel_behavior") || "delete";
    const retentionHours = interaction.options.getNumber("retention_hours") || 0;
    const recurrence = interaction.options.getString("recurrence") || "none";
    const description = interaction.options.getString("description") || "";
    const role = interaction.options.getRole("role");
    const message = interaction.options.getString("message") || "";
    const activitiesStr = interaction.options.getString("activities");
  const textChannelName = interaction.options.getString("text_channel_name");
  const voiceChannelName = interaction.options.getString("voice_channel_name");
  const channelTopic = interaction.options.getString("channel_topic");
  const imageUrl = interaction.options.getString("image_url");

    let startTime: DateTime;
    if (startTimeStr) {
      startTime = DateTime.fromFormat(startTimeStr, "yyyy-MM-dd HH:mm");
      if (!startTime.isValid) return void interaction.editReply({ content: `Fecha inválida: "${startTimeStr}"` });
    } else {
      startTime = now.plus({ seconds: 5 });
    }

    let endTime: DateTime;
    if (endTimeStr) {
      endTime = DateTime.fromFormat(endTimeStr, "yyyy-MM-dd HH:mm");
      if (!endTime.isValid) return void interaction.editReply({ content: `Fecha inválida: "${endTimeStr}"` });
    } else {
      endTime = startTime.plus({ seconds: 30 });
    }

    if (endTime <= startTime) {
      return void interaction.editReply({ content: "La fecha de fin debe ser posterior a la de inicio." });
    }

    const activities = activitiesStr
      ? activitiesStr.split(",").map(a => a.trim()).filter(Boolean)
      : [];

    const event = await createEventCore(client, guild, {
      name,
      startTime,
      endTime,
      channelBehavior,
      retentionHours,
      recurrence,
      description,
      roleId: role?.id || null,
      message,
      activities,
      textChannelName: textChannelName || null,
      voiceChannelName: voiceChannelName || null,
      channelTopic: channelTopic || null,
      imageUrl: imageUrl || null,
      requireConfirmation: interaction.options.getBoolean("require_confirmation"),
      createdBy: interaction.user.id,
    });

    const durationSec = endTime.diff(startTime, 'seconds').seconds;
    await interaction.editReply({
      content: `🧪 Evento de prueba **#${event.id}** creado. Comienza en 5 segundos, dura ${Math.round(durationSec)} segundos.`,
    });

    const eventId = event.id!;

    setTimeout(async () => {
      try {
        await startEvent(client, eventId);
        const updated = await client.db.events.getEvent(eventId);
        if (!updated || !updated.text_channel_id) return;

        const textChannel = guild.channels.cache.get(updated.text_channel_id) as TextChannel | undefined;
        if (!textChannel) return;

        const exampleEmbed = new EmbedBuilder()
          .setTitle('🧪 Evento de prueba')
          .setDescription('Este es un mensaje de ejemplo en el canal temporal.')
          .setColor(config.EMBED_COLOR as ColorResolvable)
          .addFields(
            { name: 'Duración', value: `${Math.round(durationSec)} segundos`, inline: true },
            { name: 'Comportamiento', value: 'Se eliminará al finalizar', inline: true },
          )
          .setTimestamp();

        await textChannel.send({ embeds: [exampleEmbed] });
        await textChannel.send('✅ El canal se eliminará automáticamente al finalizar el evento.');
      } catch (err) {
        client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
      }
    }, 6000);

    const endDelayMs = startTime.toMillis() - now.toMillis() + durationSec * 1000 + 1000;
    setTimeout(async () => {
      try {
        await endEvent(client, eventId);
      } catch (err) {
        client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
      }
    }, endDelayMs);
  } catch (err) {
    console.error("[event] handleTest error:", err);
    client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
    try {
      if (!interaction.replied) await interaction.reply({ content: "Error al crear evento de prueba.", ephemeral: true });
      else await interaction.editReply({ content: "Error al crear evento de prueba." }).catch(() => {});
    } catch { }
  }
}

export default module;
