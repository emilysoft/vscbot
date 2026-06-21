import {
  TextChannel,
  VoiceChannel,
  ChannelType,
  Guild,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ColorResolvable,
  CategoryChannel,
  PermissionFlagsBits,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventStatus,
} from "discord.js";
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

  if (event.is_private) {
    try {
      await client.db.events.updateEvent(eventId, { status: 'active' });
      const targetChannel = event.channel_id ? guild.channels.cache.get(event.channel_id) as TextChannel | undefined : undefined;
      if (targetChannel) {
        const customMsg = event.custom_message || '';
        const roleMention = event.role_id
          ? `<@&${event.role_id}>`
          : (eventConfig.default_role_id ? `<@&${eventConfig.default_role_id}>` : '');
        const content = [customMsg, roleMention].filter(Boolean).join(' ');
        const contentStr = content || `**${event.name}** ha comenzado!`;
        if (event.image_url) {
          const embed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR as ColorResolvable)
            .setDescription(`**${event.name}** ha comenzado!`)
            .setImage(event.image_url);
          await targetChannel.send({ content: contentStr, embeds: [embed] });
        } else {
          await targetChannel.send({ content: contentStr });
        }
      }
    } catch (err) {
      client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/startEvent`);
    }
    return;
  }

  try {
    const categoryVoz = eventConfig.voice_category
      ? (guild.channels.cache.get(eventConfig.voice_category) as CategoryChannel | undefined)
      : undefined;
    const categoryTexto = eventConfig.text_category
      ? (guild.channels.cache.get(eventConfig.text_category) as CategoryChannel | undefined)
      : undefined;

    const channelName = sanitizeChannelName(event.voice_channel_name || event.name);

    let voiceChannel: VoiceChannel | undefined;
    if (event.voice_channel_id) {
      voiceChannel = guild.channels.cache.get(event.voice_channel_id) as VoiceChannel | undefined;
      if (voiceChannel) {
        await voiceChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
          ViewChannel: null,
        });
        if (categoryVoz && voiceChannel.parentId !== categoryVoz.id) {
          await voiceChannel.setParent(categoryVoz.id, { lockPermissions: false });
        }
      }
    }
    if (!voiceChannel) {
      voiceChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: categoryVoz?.id,
      });
    }

    const textChannelName = event.text_channel_name
      ? sanitizeChannelName(event.text_channel_name)
      : channelName;
    const channelTopic = ['#' + event.id, event.channel_topic].filter(Boolean).join(' ');

    let textChannel: TextChannel | undefined;
    if (event.text_channel_id) {
      textChannel = guild.channels.cache.get(event.text_channel_id) as TextChannel | undefined;
      if (textChannel) {
        await textChannel.setTopic(channelTopic);
        await textChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
          ViewChannel: null,
        });
        if (categoryTexto && textChannel.parentId !== categoryTexto.id) {
          await textChannel.setParent(categoryTexto.id, { lockPermissions: false });
        }
      }
    }
    if (!textChannel) {
      textChannel = await guild.channels.create({
        name: textChannelName,
        type: ChannelType.GuildText,
        parent: categoryTexto?.id,
        topic: channelTopic,
      });
    }

    const customMsg = event.custom_message || '';
    const vcLink = `https://discord.com/channels/${guild.id}/${voiceChannel.id}`;
    const roleMention = event.role_id
      ? `<@&${event.role_id}>`
      : (eventConfig.default_role_id ? `<@&${eventConfig.default_role_id}>` : '');
    const content = [customMsg, vcLink, roleMention].filter(Boolean).join(' ');
    const contentStr = content || `**${event.name}** ha comenzado!`;

    let announcement;
    if (event.image_url) {
      const embed = new EmbedBuilder()
        .setColor(config.EMBED_COLOR as ColorResolvable)
        .setDescription(`**${event.name}** ha comenzado!`)
        .setImage(event.image_url);
      announcement = await textChannel.send({ content: contentStr, embeds: [embed] });
    } else {
      announcement = await textChannel.send({ content: contentStr });
    }
    await announcement.react('✅');

    let discordEventId = event.discord_event_id;
    if (event.use_discord_event && !discordEventId) {
      discordEventId = await createDiscordEvent(guild, {
        name: event.name,
        startTime: event.start_time,
        endTime: event.end_time,
        description: event.description,
        imageUrl: event.image_url,
      }, voiceChannel.id);
      if ((event.send_events_channel_msg ?? 1) && discordEventId && eventConfig.events_channel) {
        const eventsChannel = guild.channels.cache.get(eventConfig.events_channel) as TextChannel | undefined;
        if (eventsChannel) {
          const serverRoleMention = eventConfig.default_role_id
            ? `<@&${eventConfig.default_role_id}>`
            : '';
          const msg = [`https://discord.com/events/${guild.id}/${discordEventId}`, serverRoleMention].filter(Boolean).join('\n');
          const sent = await eventsChannel.send(msg).catch(() => null);
          if (sent) {
            await client.db.events.updateEvent(eventId, { events_channel_message_id: sent.id });
          }
        }
      }
    }

    if (discordEventId) {
      try {
        const discordEvent = await guild.scheduledEvents.fetch(discordEventId);
        if (discordEvent && discordEvent.status === GuildScheduledEventStatus.Scheduled) {
          await discordEvent.setStatus(GuildScheduledEventStatus.Active);
        }
      } catch (err) {
        client.errorLogger(err, client, "warn", `${process.cwd()} scheduledEvents/startEvent`);
      }
    }

    await client.db.events.updateEvent(eventId, {
      voice_channel_id: voiceChannel.id,
      text_channel_id: textChannel.id,
      message_id: announcement.id,
      discord_event_id: discordEventId,
      status: 'active',
    });
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/startEvent`);
  }
}

export async function endEvent(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'active') return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.initConfig(event.server_id);

  if (event.is_private) {
    try {
      await client.db.events.updateEvent(eventId, { status: 'ended' });
    } catch (err) {
      client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/endEvent`);
    }
    return;
  }

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

    if (eventConfig.logs_channel) {
      const logChannel = guild.channels.cache.get(eventConfig.logs_channel) as TextChannel | undefined;
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    if (event.discord_event_id) {
      try {
        const discordEvent = await guild.scheduledEvents.fetch(event.discord_event_id);
        if (discordEvent) {
          if (discordEvent.status === GuildScheduledEventStatus.Active) {
            await discordEvent.setStatus(GuildScheduledEventStatus.Completed);
          } else if (discordEvent.status === GuildScheduledEventStatus.Scheduled) {
            const activated = await discordEvent.setStatus(GuildScheduledEventStatus.Active);
            await activated.setStatus(GuildScheduledEventStatus.Completed);
          }
        }
      } catch (err) {
        client.errorLogger(err, client, "warn", `${process.cwd()} scheduledEvents/endEvent`);
      }
    }

    await client.db.events.updateEvent(eventId, { status: 'ended' });

    if (event.retention_hours <= 0) {
      await cleanupTextChannel(client, eventId);
    }

    const voiceCount = await client.db.events.getVoiceParticipantsCount(eventId);
    if (voiceCount === 0) {
      await cleanupEvent(client, eventId);
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/endEvent`);
  }
}

export async function cleanupTextChannel(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || (event.status !== 'ended' && event.status !== 'completed')) return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.initConfig(event.server_id);

  if (event.text_channel_id) {
    try {
      const textChannel = guild.channels.cache.get(event.text_channel_id) as TextChannel | undefined;
      if (textChannel) {
        if (event.channel_behavior === 'archive' && eventConfig.archive_category) {
          await textChannel.setParent(eventConfig.archive_category, { lockPermissions: false });
          await textChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
            ViewChannel: false,
          });
        } else {
          await textChannel.delete();
        }
      }
    } catch (err) {
      client.errorLogger(err, client, "warn", `${process.cwd()} scheduledEvents/cleanupTextChannel`);
    }
  }
}

export async function cleanupEvent(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'ended') return;

  const guild = client.guilds.cache.get(event.server_id);
  if (!guild) return;

  const eventConfig = await client.db.events.initConfig(event.server_id);

  if (event.voice_channel_id) {
    try {
      const voiceChannel = guild.channels.cache.get(event.voice_channel_id) as VoiceChannel | undefined;
      if (voiceChannel) {
        if (event.channel_behavior === 'archive' && eventConfig.archive_category) {
          await voiceChannel.setParent(eventConfig.archive_category, { lockPermissions: false });
          await voiceChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
            ViewChannel: false,
          });
        } else {
          await voiceChannel.delete();
        }
      }
    } catch (err) {
      client.errorLogger(err, client, "warn", `${process.cwd()} scheduledEvents/cleanupEvent`);
    }
  }

  await client.db.events.updateEvent(eventId, { status: 'completed' });

  if (event.recurrence && event.recurrence !== 'none') {
    await createNextRecurrence(client, event);
  }
}

export async function sendReminder(client: Client, eventId: number): Promise<void> {
  const event = await client.db.events.getEvent(eventId);
  if (!event || event.status !== 'scheduled' || event.reminder_sent) return;

  try {
    const eventConfig = await client.db.events.initConfig(event.server_id);
    const user = await client.users.fetch(event.created_by);
    const reminderText = `⏰ **Recordatorio:** El evento "${event.name}" está programado para las ${new Date(event.start_time).toLocaleString()}. ¿Vas a realizarlo?`;

    if (!user) {
      await client.db.events.updateEvent(eventId, { reminder_sent: 1 });
      if (eventConfig.logs_channel) {
        const guild = client.guilds.cache.get(event.server_id);
        if (guild) {
          const logChannel = guild.channels.cache.get(eventConfig.logs_channel) as TextChannel | undefined;
          if (logChannel) {
            await logChannel.send(`${reminderText}\n<@${event.created_by}> (no se pudo enviar DM)`).catch(() => {});
          }
        }
      }
      return;
    }

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
      content: reminderText,
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
        try {
          await msg.edit({
            content: `No hubo respuesta. El evento "${event.name}" ha sido cancelado. Usa \`/event edit\` para reprogramarlo.`,
            components: [],
          });
        } catch (editErr) {
          client.errorLogger(editErr, client, "warn", `${process.cwd()} scheduledEvents/sendReminder`);
        }
        await client.db.events.updateEvent(eventId, { status: 'cancelled' });
      }
    });

    await client.db.events.updateEvent(eventId, { reminder_sent: 1 });
  } catch (err) {
    client.errorLogger(err, client, "warn", `${process.cwd()} scheduledEvents/sendReminder`);
    try {
      const guild = client.guilds.cache.get(event.server_id);
      if (guild) {
        const eventConfig = await client.db.events.initConfig(event.server_id);
        if (eventConfig.logs_channel) {
          const logChannel = guild.channels.cache.get(eventConfig.logs_channel) as TextChannel | undefined;
          if (logChannel) {
            await logChannel.send(`⏰ **Recordatorio:** El evento "${event.name}" está programado para las ${new Date(event.start_time).toLocaleString()}.\n<@${event.created_by}> (no se pudo enviar DM)`).catch(() => {});
          }
        }
      }
    } catch { /* fallback total — no hay más que hacer */ }
    await client.db.events.updateEvent(eventId, { reminder_sent: 1 }).catch(() => {});
  }
}

export async function handleReactionAdd(client: Client, messageId: string, userId: string): Promise<void> {
  try {
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
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/handleReactionAdd`);
  }
}

export async function handleVoiceJoin(client: Client, guildId: string, userId: string, channelId: string): Promise<void> {
  try {
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
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/handleVoiceJoin`);
  }
}

export async function handleVoiceLeave(client: Client, guildId: string, userId: string, channelId: string): Promise<void> {
  try {
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
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/handleVoiceLeave`);
  }
}

export async function createPrivateVoiceChannel(guild: Guild, eventName: string, eventConfig: { voice_category?: string | null } | null, channelNameOverride?: string | null): Promise<string | null> {
  try {
    const channelName = sanitizeChannelName(channelNameOverride || eventName);
    const categoryVoz = eventConfig?.voice_category
      ? (guild.channels.cache.get(eventConfig.voice_category) as CategoryChannel | undefined)
      : undefined;

    const voiceChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: categoryVoz?.id,
    });
    await voiceChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
      ViewChannel: false,
    });
    return voiceChannel.id;
  } catch (err) {
    console.error('[createPrivateVoiceChannel] failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || 'image/png';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function createDiscordEvent(guild: Guild, params: {
  name: string;
  startTime: string;
  endTime: string | null;
  description: string;
  imageUrl: string | null;
}, voiceChannelId?: string): Promise<string | null> {
  try {
    const isExternal = !voiceChannelId;
    const dbStartTime = new Date(params.startTime).getTime();
    const now = Date.now();
    const offset = dbStartTime <= now ? (now + 120000 - dbStartTime) : 0;
    const finalStartTime = new Date(dbStartTime + offset);
    const finalEndTime = params.endTime ? new Date(new Date(params.endTime).getTime() + offset) : undefined;

    const image = params.imageUrl ? await fetchImageAsBase64(params.imageUrl) : undefined;

    const discordEvent = await guild.scheduledEvents.create({
      name: params.name,
      scheduledStartTime: finalStartTime,
      scheduledEndTime: finalEndTime,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: isExternal ? GuildScheduledEventEntityType.External : GuildScheduledEventEntityType.Voice,
      description: params.description || undefined,
      image,
      ...(isExternal
        ? { entityMetadata: { location: 'En el servidor' } }
        : { channel: voiceChannelId }),
    });
    return discordEvent.id;
  } catch (err) {
    console.error('[createDiscordEvent] failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function createNextRecurrence(client: Client, event: DB_ScheduledEvent): Promise<void> {
  try {
    const nextStart = calculateNextDate(event.start_time, event.recurrence);
    const nextEnd = event.end_time ? calculateNextDate(event.end_time, event.recurrence) : null;
    if (!nextStart) return;

    const guild = client.guilds.cache.get(event.server_id);
    let discordEventId: string | null = null;
    let voiceChannelId: string | null = null;
    let textChannelId: string | null = event.text_channel_id;
    const eventConfig = guild ? await client.db.events.initConfig(event.server_id) : null;

    if (guild && eventConfig && !event.is_private) {
      voiceChannelId = event.voice_channel_id;
      if (!voiceChannelId) {
        voiceChannelId = await createPrivateVoiceChannel(guild, event.name, eventConfig);
      }
      if (event.use_discord_event && voiceChannelId) {
        discordEventId = await createDiscordEvent(guild, {
          name: event.name,
          startTime: nextStart,
          endTime: nextEnd,
          description: event.description,
          imageUrl: event.image_url,
        }, voiceChannelId);
      }

      if (discordEventId && event.events_channel_message_id && eventConfig.events_channel) {
        const eventsChannel = guild.channels.cache.get(eventConfig.events_channel) as TextChannel | undefined;
        if (eventsChannel) {
          try {
            const oldMsg = await eventsChannel.messages.fetch(event.events_channel_message_id);
            const serverRoleMention = eventConfig.default_role_id
              ? `<@&${eventConfig.default_role_id}>`
              : '';
            await oldMsg.edit(`📅 **${event.name}** — ${new Date(nextStart).toLocaleString()}\nhttps://discord.com/events/${guild.id}/${discordEventId}\n${serverRoleMention}`);
          } catch { }
        }
      }
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
      text_channel_name: event.text_channel_name,
      channel_topic: event.channel_topic,
      voice_channel_name: event.voice_channel_name,
      image_url: event.image_url,
      require_confirmation: event.require_confirmation,
      is_private: event.is_private,
      send_events_channel_msg: event.send_events_channel_msg,
      events_channel_message_id: event.events_channel_message_id,
      voice_channel_id: voiceChannelId,
      text_channel_id: textChannelId,
      message_id: null,
      discord_event_id: discordEventId,
      reminder_sent: event.is_private ? 1 : 0,
    });
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/createNextRecurrence`);
  }
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
  try {
    const event = await client.db.events.getEvent(eventId);
    if (!event || event.status !== 'scheduled') return;

    if (confirmed) {
      await client.db.events.updateEvent(eventId, { reminder_sent: 1 });
    } else {
      await client.db.events.updateEvent(eventId, { status: 'cancelled' });
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} scheduledEvents/handleConfirmationResponse`);
  }
}

export function sanitizeChannelName(name: string): string {
  return name
    .normalize('NFD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_ ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || 'evento';
}
