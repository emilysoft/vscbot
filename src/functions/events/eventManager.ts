import { TextChannel, VoiceChannel, ChannelType, Guild, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ColorResolvable, CategoryChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import { DB_ScheduledEvent } from "../../db/EventTypes.js";
import config from "../../config/config.json" with { type: "json" };

export async function startEvent(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'scheduled') return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.initConfig(event.server_id);
  if (!eventConfig.enabled) return;

  try {
    const categoryVoz = eventConfig.voice_category
      ? (guild.channels.cache.get(eventConfig.voice_category) as CategoryChannel | undefined)
      : undefined;
    const categoryTexto = eventConfig.text_category
      ? (guild.channels.cache.get(eventConfig.text_category) as CategoryChannel | undefined)
      : undefined;

    const channelName = sanitizeChannelName(event.name);

    const voiceChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: categoryVoz?.id,
    });

    const textChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryTexto?.id,
      topic: `Evento: ${event.name}`,
    });

    const roleMention = config.eventRoleId ? `<@&${config.eventRoleId}>` : '';
    const customMsg = event.custom_message || '';
    const content = [roleMention, customMsg].filter(Boolean).join(' ');

    const announcement = await textChannel.send({ content: content || `**${event.name}** ha comenzado!` });
    await announcement.react('✅');

    let discordEventId = event.discord_event_id;
    if (event.use_discord_event && !discordEventId) {
      discordEventId = await createDiscordEvent(guild, event, voiceChannel.id);
    }

    await client.db.events.updateEvent(eventId, {
      voice_channel_id: voiceChannel.id,
      text_channel_id: textChannel.id,
      message_id: announcement.id,
      discord_event_id: discordEventId,
      status: 'active',
    });
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} events/startEvent`);
  }
}

export async function endEvent(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'active') return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.getConfig(event.server_id);

  try {
    const participants = await client.db.events.getParticipants(eventId);
    const voiceUsers = participants.filter(p => p.source === 'voice' && p.left_at !== null);
    const reactionUsers = participants.filter(p => p.source === 'reaction');
    const voiceUnique = new Set(voiceUsers.map(p => p.user_id)).size;
    const reactionUnique = new Set(reactionUsers.map(p => p.user_id)).size;

    const activities = await client.db.events.getActivities(eventId);

    const embed = new EmbedBuilder()
      .setTitle(`Evento finalizado: ${event.name}`)
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .addFields(
        { name: 'Participantes (voz)', value: `${voiceUnique}`, inline: true },
        { name: 'Participantes (reacción)', value: `${reactionUnique}`, inline: true },
        { name: 'Total únicos', value: `${new Set(participants.map(p => p.user_id)).size}`, inline: true },
      )
      .setTimestamp();

    if (activities.length > 0) {
      const actText = activities.map(a => `${a.name}: ${a.success_count}/${a.total_count}`).join('\n');
      embed.addFields({ name: 'Actividades', value: actText });
    }

    if (eventConfig?.logs_channel) {
      const logChannel = guild.channels.cache.get(eventConfig.logs_channel) as TextChannel | undefined;
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    await client.db.events.updateEvent(eventId, { status: 'ended' });

    if (event.retention_hours <= 0) {
      await cleanupTextChannel(client, eventId);
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} events/endEvent`);
  }
}

export async function cleanupTextChannel(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'ended') return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.getConfig(event.server_id);

  try {
    if (event.text_channel_id) {
      const textChannel = guild.channels.cache.get(event.text_channel_id) as TextChannel | undefined;
      if (textChannel) {
        if (event.channel_behavior === 'archive' && eventConfig?.archive_category) {
          await textChannel.setParent(eventConfig.archive_category, { lockPermissions: false });
        } else {
          await textChannel.delete();
        }
      }
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} events/cleanupTextChannel`);
  }
}

export async function cleanupEvent(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'ended') return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.getConfig(event.server_id);

  try {
    if (event.voice_channel_id) {
      const voiceChannel = guild.channels.cache.get(event.voice_channel_id) as VoiceChannel | undefined;
      if (voiceChannel) {
        if (event.channel_behavior === 'archive' && eventConfig?.archive_category) {
          await voiceChannel.setParent(eventConfig.archive_category, { lockPermissions: false });
        } else {
          await voiceChannel.delete();
        }
      }
    }

    await client.db.events.updateEvent(eventId, { status: 'completed' });

    if (event.recurrence && event.recurrence !== 'none') {
      await createNextRecurrence(client, event);
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} events/cleanupEvent`);
  }
}

export async function sendReminder(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'scheduled' || event.reminder_sent) return;

  try {
    const user = await client.users.fetch(event.created_by);
    if (!user) return;

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`event_confirm_yes_${eventId}`)
          .setLabel('Sí, voy a realizarlo')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`event_confirm_no_${eventId}`)
          .setLabel('No, reprogramar')
          .setStyle(ButtonStyle.Danger),
      );

    const msg = await user.send({
      content: `⏰ **Recordatorio:** El evento "${event.name}" está programado para las ${new Date(event.start_time).toLocaleString()}. ¿Vas a realizarlo?`,
      components: [row],
    });

    const filter = (i: any) => i.user.id === event.created_by;
    const collector = msg.createMessageComponentCollector({ filter, time: 30 * 60 * 1000 });

    collector.on('collect', async (i: any) => {
      if (i.customId === `event_confirm_yes_${eventId}`) {
        await i.update({ content: 'Perfecto, el evento seguirá su curso.', components: [] });
      } else if (i.customId === `event_confirm_no_${eventId}`) {
        await i.update({
          content: 'Has cancelado el evento. Si quieres reprogramarlo, usa `/event edit` con una nueva fecha.',
          components: [],
        });
        await client.db.events.updateEvent(eventId, { status: 'cancelled' });
      }
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await msg.edit({
          content: `No hubo respuesta. El evento "${event.name}" ha sido cancelado. Usa \`/event edit\` para reprogramarlo.`,
          components: [],
        });
        await client.db.events.updateEvent(eventId, { status: 'cancelled' });
      }
    });

    await client.db.events.updateEvent(eventId, { reminder_sent: 1 });
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} events/sendReminder`);
  }
}

export async function handleReactionAdd(client: Client, messageId: string, userId: string): Promise<void> {
  const events = await client.db.events.getEventsByStatus('active');
  const event = events.find(e => e.message_id === messageId);
  if (!event || !event.id) return;

  const existing = await client.db.events.getParticipantByUserAndEvent(event.id, userId, 'reaction');
  if (existing) return;

  await client.db.events.addParticipant({
    event_id: event.id,
    user_id: userId,
    joined_at: new Date().toISOString(),
    left_at: null,
    duration_sec: null,
    source: 'reaction',
  });
}

export async function handleVoiceJoin(client: Client, guildId: string, userId: string, channelId: string): Promise<void> {
  const events = await client.db.events.getEventsByStatus('active');
  const event = events.find(e => e.voice_channel_id === channelId && e.server_id === guildId);
  if (!event || !event.id) return;

  const existing = await client.db.events.getParticipantByUserAndEvent(event.id, userId, 'voice');
  if (existing && !existing.left_at) return;

  await client.db.events.addParticipant({
    event_id: event.id,
    user_id: userId,
    joined_at: new Date().toISOString(),
    left_at: null,
    duration_sec: null,
    source: 'voice',
  });
}

export async function handleVoiceLeave(client: Client, guildId: string, userId: string, channelId: string): Promise<void> {
  const allEvents = await client.db.events.getEventsByGuild(guildId);
  const events = allEvents.filter(e =>
    e.voice_channel_id === channelId &&
    (e.status === 'active' || e.status === 'ended')
  );

  for (const event of events) {
    if (!event.id) continue;

    const participant = await client.db.events.getParticipantByUserAndEvent(event.id, userId, 'voice');
    if (participant && participant.id && !participant.left_at) {
      const leftAt = new Date();
      const joinedAt = new Date(participant.joined_at);
      const durationSec = Math.floor((leftAt.getTime() - joinedAt.getTime()) / 1000);

      await client.db.events.updateParticipant(participant.id, {
        left_at: leftAt.toISOString(),
        duration_sec: durationSec,
      });
    }

    if (event.status === 'ended') {
      const voiceCount = await client.db.events.getVoiceParticipantsCount(event.id);
      if (voiceCount === 0) {
        await cleanupEvent(client, event.id);
      }
    }
  }
}

export async function createDiscordEvent(guild: Guild, event: DB_ScheduledEvent, voiceChannelId?: string): Promise<string | null> {
  try {
    const isExternal = !voiceChannelId;
    const discordEvent = await guild.scheduledEvents.create({
      name: event.name,
      scheduledStartTime: event.start_time,
      scheduledEndTime: event.end_time || undefined,
      privacyLevel: 2,
      entityType: isExternal ? 3 : 2,
      description: event.description || undefined,
      ...(isExternal
        ? { entityMetadata: { location: 'En el servidor' } }
        : { channel: voiceChannelId }),
    });
    return discordEvent.id;
  } catch (err) {
    console.error('[createDiscordEvent] error:', err);
    return null;
  }
}

async function createNextRecurrence(client: Client, event: DB_ScheduledEvent): Promise<void> {
  const nextStart = calculateNextDate(event.start_time, event.recurrence);
  const nextEnd = event.end_time ? calculateNextDate(event.end_time, event.recurrence) : null;
  if (!nextStart) return;

  const guild = client.guilds.cache.get(event.server_id);
  let discordEventId: string | null = null;
  if (guild && event.use_discord_event) {
    discordEventId = await createDiscordEvent(guild, {
      ...event,
      start_time: nextStart,
      end_time: nextEnd,
    });
  }

  await client.db.events.createEvent({
    server_id: event.server_id,
    name: event.name,
    description: event.description,
    role_id: event.role_id,
    channel_id: event.channel_id,
    custom_message: event.custom_message,
    use_discord_event: event.use_discord_event,
    start_time: nextStart,
    end_time: nextEnd,
    recurrence: event.recurrence,
    activities: event.activities,
    channel_behavior: event.channel_behavior,
    retention_hours: event.retention_hours,
    status: 'scheduled',
    created_by: event.created_by,
    voice_channel_id: null,
    text_channel_id: null,
    message_id: null,
    discord_event_id: discordEventId,
    reminder_sent: 0,
  });
}

function calculateNextDate(dateStr: string, recurrence: string): string | null {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }
  return date.toISOString();
}

export async function handleConfirmationResponse(client: Client, eventId: number, confirmed: boolean): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'scheduled') return;

  if (confirmed) {
    await client.db.events.updateEvent(eventId, { reminder_sent: 1 });
  } else {
    await client.db.events.updateEvent(eventId, { status: 'cancelled' });
  }
}

function sanitizeChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-_ ]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 32) || 'evento';
}
