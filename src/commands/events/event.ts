import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  TextChannel,
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
      .addBooleanOption(opt => opt.setName("discord_events").setDescription("Usar eventos de Discord")))
    .addSubcommand(sub => sub
      .setName("create")
      .setDescription("Crear un nuevo evento programado")
      .addStringOption(opt => opt.setName("name").setDescription("Nombre del evento").setRequired(true).setMaxLength(100))
      .addStringOption(opt => opt.setName("start_time").setDescription("Fecha y hora (YYYY-MM-DD HH:MM)").setRequired(true))
      .addStringOption(opt => opt.setName("end_time").setDescription("Fecha y hora de fin (YYYY-MM-DD HH:MM)"))
      .addStringOption(opt => opt.setName("channel_behavior").setDescription("Qué hacer con los canales al terminar").addChoices(...CHANNEL_BEHAVIOR_CHOICES))
      .addNumberOption(opt => opt.setName("retention_hours").setDescription("Horas antes de archivar/eliminar el canal de texto (0 = inmediato)"))
      .addStringOption(opt => opt.setName("recurrence").setDescription("Recurrencia").addChoices(...RECURRENCE_CHOICES))
      .addStringOption(opt => opt.setName("description").setDescription("Descripción del evento").setMaxLength(500))
      .addRoleOption(opt => opt.setName("role").setDescription("Rol para ping"))
      .addChannelOption(opt => opt.setName("channel").setDescription("Canal para el anuncio"))
      .addStringOption(opt => opt.setName("message").setDescription("Mensaje personalizado de inicio").setMaxLength(500))
      .addStringOption(opt => opt.setName("activities").setDescription("Actividades separadas por coma")))
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
      .addChannelOption(opt => opt.setName("channel").setDescription("Nuevo canal para anuncio"))
      .addStringOption(opt => opt.setName("message").setDescription("Nuevo mensaje personalizado").setMaxLength(500))
      .addStringOption(opt => opt.setName("activities").setDescription("Nuevas actividades separadas por coma")))
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
      .addNumberOption(opt => opt.setName("id").setDescription("ID del evento").setRequired(true).setAutocomplete(true)))
    .addSubcommand(sub => sub
      .setName("test")
      .setDescription("Crear un evento de prueba de 2 minutos (para testing rápido)")),

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
      } catch { }
    }
  },
};

async function handleSettings(interaction: ChatInputCommandInteraction, client: Client, guild: any) {
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

async function handleSetup(interaction: ChatInputCommandInteraction, client: Client, guild: any) {
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

    if (enabled !== null) updates.enabled = enabled ? 1 : 0;
    if (role) updates.default_role_id = role.id;
    if (eventsChannel) updates.events_channel = eventsChannel.id;
    if (logsChannel) updates.logs_channel = logsChannel.id;
    if (voiceCategory) updates.voice_category = voiceCategory.id;
    if (textCategory) updates.text_category = textCategory.id;
    if (archiveCategory) updates.archive_category = archiveCategory.id;
    if (discordEvents !== null) updates.use_discord_events = discordEvents ? 1 : 0;

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

async function handleCreate(interaction: ChatInputCommandInteraction, client: Client, guild: any) {
  const name = interaction.options.getString("name", true);
  const startTimeStr = interaction.options.getString("start_time", true);
  const endTimeStr = interaction.options.getString("end_time");
  const channelBehavior = interaction.options.getString("channel_behavior") || "delete";
  const retentionHours = interaction.options.getNumber("retention_hours") || 0;
  const recurrence = interaction.options.getString("recurrence") || "none";
  const description = interaction.options.getString("description") || "";
  const role = interaction.options.getRole("role");
  const channel = interaction.options.getChannel("channel");
  const message = interaction.options.getString("message") || "";
  const activitiesStr = interaction.options.getString("activities");

  const startTime = DateTime.fromFormat(startTimeStr, "yyyy-MM-dd HH:mm");
  if (!startTime.isValid) {
    return void interaction.reply({ content: `Fecha inválida: "${startTimeStr}". Usa el formato YYYY-MM-DD HH:MM (ej: 2026-06-10 20:00)`, ephemeral: true });
  }

  let endTime: DateTime | null = null;
  if (endTimeStr) {
    endTime = DateTime.fromFormat(endTimeStr, "yyyy-MM-dd HH:mm");
    if (!endTime.isValid) {
      return void interaction.reply({ content: `Fecha de fin inválida: "${endTimeStr}". Usa el formato YYYY-MM-DD HH:MM`, ephemeral: true });
    }
    if (endTime <= startTime) {
      return void interaction.reply({ content: "La fecha de fin debe ser posterior a la de inicio.", ephemeral: true });
    }
  }

  const activities = activitiesStr
    ? activitiesStr.split(",").map(a => a.trim()).filter(Boolean)
    : [];

  const eventConfig = await client.db.events.initConfig(guild.id);

  let discordEventId: string | null = null;
  if (eventConfig.use_discord_events) {
    const discordId = await createDiscordEvent(guild, {
      server_id: guild.id,
      name,
      description,
      role_id: null,
      channel_id: null,
      custom_message: null,
      use_discord_event: 1,
      start_time: startTime.toISO()!,
      end_time: endTime?.toISO() || null,
      recurrence,
      activities: JSON.stringify(activities),
      channel_behavior: channelBehavior,
      retention_hours: retentionHours,
      status: 'scheduled',
      created_by: interaction.user.id,
      voice_channel_id: null,
      text_channel_id: null,
      message_id: null,
      discord_event_id: null,
      reminder_sent: 0,
      created_at: new Date().toISOString(),
    });

    if (discordId) {
      discordEventId = discordId;
      if (eventConfig.events_channel) {
        const eventsChannel = guild.channels.cache.get(eventConfig.events_channel) as TextChannel | undefined;
        if (eventsChannel) {
          await eventsChannel.send(`📅 **${name}** — ${startTime.toLocaleString(DateTime.DATETIME_MED)}\nhttps://discord.com/events/${guild.id}/${discordId}`);
        }
      }
    }
  }

  const event = await client.db.events.createEvent({
    server_id: guild.id,
    name,
    description,
    role_id: role?.id || null,
    channel_id: channel?.id || null,
    custom_message: message || null,
    use_discord_event: eventConfig.use_discord_events ? 1 : 0,
    start_time: startTime.toISO()!,
    end_time: endTime?.toISO() || null,
    recurrence,
    activities: JSON.stringify(activities),
    channel_behavior: channelBehavior,
    retention_hours: retentionHours,
    status: 'scheduled',
    created_by: interaction.user.id,
    voice_channel_id: null,
    text_channel_id: null,
    message_id: null,
    discord_event_id: discordEventId,
    reminder_sent: 0,
  });

  if (activities.length > 0) {
    for (const activityName of activities) {
      await client.db.events.addActivity({
        event_id: event.id!,
        name: activityName,
        success_count: 0,
        total_count: 0,
      });
    }
  }

  await rescheduleEvent(client, event.id!);

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

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleList(interaction: ChatInputCommandInteraction, client: Client, guild: any) {
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

async function handleEdit(interaction: ChatInputCommandInteraction, client: Client, guild: any) {
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
  const channel = interaction.options.getChannel("channel");
  const message = interaction.options.getString("message");
  const activitiesStr = interaction.options.getString("activities");

  if (name) updates.name = name;
  if (channelBehavior) updates.channel_behavior = channelBehavior;
  if (retentionHours !== null && retentionHours !== undefined) updates.retention_hours = retentionHours;
  if (recurrence) updates.recurrence = recurrence;
  if (description !== null && description !== undefined) updates.description = description;
  if (role) updates.role_id = role.id;
  if (channel) updates.channel_id = channel.id;
  if (message !== null && message !== undefined) updates.custom_message = message;

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

  if (event.discord_event_id) {
    try {
      const guild = interaction.guild;
      if (guild) {
        const discordEvent = await guild.scheduledEvents.fetch(event.discord_event_id);
        if (discordEvent) await discordEvent.delete();
      }
    } catch { }
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

async function handleTest(interaction: ChatInputCommandInteraction, client: Client, guild: any) {
  try {
    const now = DateTime.now();
    const startTime = now.plus({ seconds: 5 });
    const endTime = now.plus({ seconds: 35 });

    const event = await client.db.events.createEvent({
      server_id: guild.id,
      name: `🧪 Test ${now.toFormat('HH:mm:ss')}`,
      description: 'Evento de prueba',
      role_id: null,
      channel_id: null,
      custom_message: null,
      use_discord_event: 1,
      start_time: startTime.toISO()!,
      end_time: endTime.toISO()!,
      recurrence: 'none',
      activities: '[]',
      channel_behavior: 'delete',
      retention_hours: 0,
      status: 'scheduled',
      created_by: interaction.user.id,
      voice_channel_id: null,
      text_channel_id: null,
      message_id: null,
      discord_event_id: null,
      reminder_sent: 0,
    });

    await interaction.reply({
      content: `🧪 Evento de prueba **#${event.id}** creado. En 5 segundos se creará un canal temporal de texto.`,
      ephemeral: true,
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
            { name: 'Duración', value: '30 segundos', inline: true },
            { name: 'Comportamiento', value: 'Se eliminará al finalizar', inline: true },
          )
          .setTimestamp();

        await textChannel.send({ embeds: [exampleEmbed] });
        await textChannel.send('✅ El canal se eliminará automáticamente en 30 segundos.');
      } catch (err) {
        client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
      }
    }, 6000);

    setTimeout(async () => {
      try {
        await endEvent(client, eventId);
      } catch (err) {
        client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
      }
    }, 36000);
  } catch (err) {
    console.error("[event] handleTest error:", err);
    client.errorLogger(err, client, "error", `${process.cwd()} commands/events/event`);
    try {
      if (!interaction.replied) await interaction.reply({ content: "Error al crear evento de prueba.", ephemeral: true });
    } catch { }
  }
}

export default module;
