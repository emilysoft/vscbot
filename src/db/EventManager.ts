import { Database as SQLiteDatabase } from 'sqlite';
import { DB_EventConfig, DB_ScheduledEvent, DB_EventParticipant, DB_EventActivity } from './EventTypes.js';

export default class EventManager {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // ── Config ──

  async getConfig(serverId: string): Promise<DB_EventConfig | undefined> {
    return this.db.get<DB_EventConfig>(
      `SELECT * FROM server_event_config WHERE server_id = ?`,
      serverId
    );
  }

  async upsertConfig(config: DB_EventConfig): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO server_event_config
       (server_id, enabled, default_role_id, events_channel, logs_channel,
        voice_category, text_category, archive_category,
        use_discord_events, require_confirmation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      config.server_id,
      config.enabled,
      config.default_role_id,
      config.events_channel,
      config.logs_channel,
      config.voice_category,
      config.text_category,
      config.archive_category,
      config.use_discord_events,
      config.require_confirmation ?? 1,
      config.created_at || new Date().toISOString()
    );
  }

  async initConfig(serverId: string): Promise<DB_EventConfig> {
    const existing = await this.getConfig(serverId);
    if (existing) return existing;
    const config: DB_EventConfig = {
      server_id: serverId,
      enabled: 0,
      default_role_id: '',
      events_channel: '',
      logs_channel: '',
      voice_category: '',
      text_category: '',
      archive_category: '',
      use_discord_events: 0,
      require_confirmation: 1,
      created_at: new Date().toISOString(),
    };
    await this.upsertConfig(config);
    return config;
  }

  // ── Events ──

  async createEvent(data: Omit<DB_ScheduledEvent, 'id' | 'created_at'>): Promise<DB_ScheduledEvent> {
    const result = await this.db.run(
      `INSERT INTO events
       (server_id, name, description, role_id, channel_id, custom_message,
        use_discord_event, start_time, end_time, recurrence, activities,
        channel_behavior, retention_hours, status, created_by,
        text_channel_name, channel_topic, voice_channel_name, image_url, require_confirmation,
        voice_channel_id, text_channel_id, message_id, discord_event_id, reminder_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.server_id,
      data.name,
      data.description,
      data.role_id,
      data.channel_id,
      data.custom_message,
      data.use_discord_event,
      data.start_time,
      data.end_time,
      data.recurrence,
      data.activities,
      data.channel_behavior || 'delete',
      data.retention_hours || 0,
      data.status || 'scheduled',
      data.created_by,
      data.text_channel_name,
      data.channel_topic,
      data.voice_channel_name,
      data.image_url ?? null,
      data.require_confirmation ?? null,
      data.voice_channel_id,
      data.text_channel_id,
      data.message_id,
      data.discord_event_id,
      data.reminder_sent || 0
    );
    const event = await this.db.get<DB_ScheduledEvent>(
      `SELECT * FROM events WHERE id = ?`,
      result.lastID
    );
    return event!;
  }

  async getEvent(id: number): Promise<DB_ScheduledEvent | undefined> {
    return this.db.get<DB_ScheduledEvent>(`SELECT * FROM events WHERE id = ?`, id);
  }

  async updateEvent(id: number, data: Partial<DB_ScheduledEvent>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(id);
    await this.db.run(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async deleteEvent(id: number): Promise<void> {
    await this.db.run(`UPDATE events SET status = 'cancelled' WHERE id = ?`, id);
  }

  async getEventsByGuild(serverId: string, status?: string): Promise<DB_ScheduledEvent[]> {
    if (status) {
      return this.db.all<DB_ScheduledEvent[]>(
        `SELECT * FROM events WHERE server_id = ? AND status = ? ORDER BY start_time ASC`,
        serverId, status
      );
    }
    return this.db.all<DB_ScheduledEvent[]>(
      `SELECT * FROM events WHERE server_id = ? ORDER BY start_time ASC`,
      serverId
    );
  }

  async getEventsByStatus(status: string, before?: string): Promise<DB_ScheduledEvent[]> {
    if (before) {
      return this.db.all<DB_ScheduledEvent[]>(
        `SELECT * FROM events WHERE status = ? AND start_time <= ? ORDER BY start_time ASC`,
        status, before
      );
    }
    return this.db.all<DB_ScheduledEvent[]>(
      `SELECT * FROM events WHERE status = ? ORDER BY start_time ASC`,
      status
    );
  }

  async getEventsByStatusAndTime(status: string, before: string, after: string): Promise<DB_ScheduledEvent[]> {
    return this.db.all<DB_ScheduledEvent[]>(
      `SELECT * FROM events WHERE status = ? AND start_time >= ? AND start_time <= ? ORDER BY start_time ASC`,
      status, after, before
    );
  }

  // ── Participants ──

  async addParticipant(data: Omit<DB_EventParticipant, 'id'>): Promise<DB_EventParticipant> {
    const result = await this.db.run(
      `INSERT INTO event_participants (event_id, user_id, joined_at, left_at, duration_sec, source)
       VALUES (?, ?, ?, ?, ?, ?)`,
      data.event_id, data.user_id, data.joined_at, data.left_at, data.duration_sec, data.source
    );
    const p = await this.db.get<DB_EventParticipant>(
      `SELECT * FROM event_participants WHERE id = ?`, result.lastID
    );
    return p!;
  }

  async updateParticipant(id: number, data: Partial<DB_EventParticipant>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(id);
    await this.db.run(
      `UPDATE event_participants SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async getParticipants(eventId: number): Promise<DB_EventParticipant[]> {
    return this.db.all<DB_EventParticipant[]>(
      `SELECT * FROM event_participants WHERE event_id = ? ORDER BY joined_at ASC`,
      eventId
    );
  }

  async getParticipantByUserAndEvent(eventId: number, userId: string, source: string): Promise<DB_EventParticipant | undefined> {
    return this.db.get<DB_EventParticipant>(
      `SELECT * FROM event_participants WHERE event_id = ? AND user_id = ? AND source = ?`,
      eventId, userId, source
    );
  }

  async getVoiceParticipantsCount(eventId: number): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM event_participants WHERE event_id = ? AND source = 'voice' AND left_at IS NULL`,
      eventId
    );
    return row?.count || 0;
  }

  // ── Activities ──

  async addActivity(data: Omit<DB_EventActivity, 'id'>): Promise<DB_EventActivity> {
    const result = await this.db.run(
      `INSERT INTO event_activities (event_id, name, success_count, total_count)
       VALUES (?, ?, ?, ?)`,
      data.event_id, data.name, data.success_count, data.total_count
    );
    const a = await this.db.get<DB_EventActivity>(
      `SELECT * FROM event_activities WHERE id = ?`, result.lastID
    );
    return a!;
  }

  async updateActivity(id: number, data: Partial<DB_EventActivity>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(id);
    await this.db.run(
      `UPDATE event_activities SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async getActivities(eventId: number): Promise<DB_EventActivity[]> {
    return this.db.all<DB_EventActivity[]>(
      `SELECT * FROM event_activities WHERE event_id = ? ORDER BY id ASC`,
      eventId
    );
  }
}
