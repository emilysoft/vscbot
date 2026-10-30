import { and, asc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import {
  DB_EventConfig,
  DB_ScheduledEvent,
  DB_EventParticipant,
  DB_EventActivity,
} from "./EventTypes.js";
import type { AppDatabase } from "./client.js";
import { omitKeys } from "./helpers.js";
import {
  eventActivities,
  eventParticipants,
  events,
  serverEventConfig,
} from "./schema.js";

export default class EventManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  // ── Config ──

  async getConfig(serverId: string): Promise<DB_EventConfig | undefined> {
    return this.db
      .select()
      .from(serverEventConfig)
      .where(eq(serverEventConfig.server_id, serverId))
      .get();
  }

  async upsertConfig(config: DB_EventConfig): Promise<void> {
    this.db
      .insert(serverEventConfig)
      .values({
        server_id: config.server_id,
        enabled: config.enabled,
        default_role_id: config.default_role_id,
        events_channel: config.events_channel,
        logs_channel: config.logs_channel,
        voice_category: config.voice_category,
        text_category: config.text_category,
        archive_category: config.archive_category,
        use_discord_events: config.use_discord_events,
        require_confirmation: config.require_confirmation ?? true,
        created_at: config.created_at || new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: serverEventConfig.server_id,
        set: {
          enabled: config.enabled,
          default_role_id: config.default_role_id,
          events_channel: config.events_channel,
          logs_channel: config.logs_channel,
          voice_category: config.voice_category,
          text_category: config.text_category,
          archive_category: config.archive_category,
          use_discord_events: config.use_discord_events,
          require_confirmation: config.require_confirmation ?? true,
          created_at: config.created_at || new Date().toISOString(),
        },
      })
      .run();
  }

  async initConfig(serverId: string): Promise<DB_EventConfig> {
    const existing = await this.getConfig(serverId);
    if (existing) return existing;
    const config: DB_EventConfig = {
      server_id: serverId,
      enabled: false,
      default_role_id: "",
      events_channel: "",
      logs_channel: "",
      voice_category: "",
      text_category: "",
      archive_category: "",
      use_discord_events: false,
      require_confirmation: true,
      created_at: new Date().toISOString(),
    };
    await this.upsertConfig(config);
    return config;
  }

  // ── Events ──

  async createEvent(
    data: Omit<DB_ScheduledEvent, "id" | "created_at">,
  ): Promise<DB_ScheduledEvent> {
    const event = this.db
      .insert(events)
      .values({
        server_id: data.server_id,
        name: data.name,
        description: data.description,
        role_id: data.role_id,
        channel_id: data.channel_id,
        custom_message: data.custom_message,
        use_discord_event: data.use_discord_event,
        start_time: data.start_time,
        end_time: data.end_time,
        recurrence: data.recurrence,
        activities: data.activities,
        channel_behavior: data.channel_behavior || "delete",
        retention_hours: data.retention_hours || 0,
        status: data.status || "scheduled",
        created_by: data.created_by,
        text_channel_name: data.text_channel_name,
        channel_topic: data.channel_topic,
        voice_channel_name: data.voice_channel_name,
        image_url: data.image_url ?? null,
        require_confirmation: data.require_confirmation ?? null,
        is_private: data.is_private || false,
        send_events_channel_msg: data.send_events_channel_msg ?? null,
        events_channel_message_id: data.events_channel_message_id ?? null,
        voice_channel_id: data.voice_channel_id,
        text_channel_id: data.text_channel_id,
        message_id: data.message_id,
        discord_event_id: data.discord_event_id,
        reminder_sent: data.reminder_sent || false,
      })
      .returning()
      .get();
    return event!;
  }

  async getEvent(id: number): Promise<DB_ScheduledEvent | undefined> {
    return this.db.select().from(events).where(eq(events.id, id)).get();
  }

  async updateEvent(
    id: number,
    data: Partial<DB_ScheduledEvent>,
  ): Promise<void> {
    const values = omitKeys(data, "id", "created_at");
    if (Object.keys(values).length === 0) return;
    this.db.update(events).set(values).where(eq(events.id, id)).run();
  }

  async deleteEvent(id: number): Promise<void> {
    this.db
      .update(events)
      .set({ status: "cancelled" })
      .where(eq(events.id, id))
      .run();
  }

  async getEventsByGuild(
    serverId: string,
    status?: string,
  ): Promise<DB_ScheduledEvent[]> {
    if (status) {
      return this.db
        .select()
        .from(events)
        .where(and(eq(events.server_id, serverId), eq(events.status, status)))
        .orderBy(asc(events.start_time))
        .all();
    }
    return this.db
      .select()
      .from(events)
      .where(eq(events.server_id, serverId))
      .orderBy(asc(events.start_time))
      .all();
  }

  async getEventsByStatus(
    status: string,
    before?: string,
  ): Promise<DB_ScheduledEvent[]> {
    if (before) {
      return this.db
        .select()
        .from(events)
        .where(and(eq(events.status, status), lte(events.start_time, before)))
        .orderBy(asc(events.start_time))
        .all();
    }
    return this.db
      .select()
      .from(events)
      .where(eq(events.status, status))
      .orderBy(asc(events.start_time))
      .all();
  }

  async getEventsByStatusAndTime(
    status: string,
    before: string,
    after: string,
  ): Promise<DB_ScheduledEvent[]> {
    return this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, status),
          gte(events.start_time, after),
          lte(events.start_time, before),
        ),
      )
      .orderBy(asc(events.start_time))
      .all();
  }

  // ── Participants ──

  async addParticipant(
    data: Omit<DB_EventParticipant, "id">,
  ): Promise<DB_EventParticipant> {
    const participant = this.db
      .insert(eventParticipants)
      .values({
        event_id: data.event_id,
        user_id: data.user_id,
        joined_at: data.joined_at,
        left_at: data.left_at,
        duration_sec: data.duration_sec,
        source: data.source,
      })
      .returning()
      .get();
    return participant!;
  }

  async updateParticipant(
    id: number,
    data: Partial<DB_EventParticipant>,
  ): Promise<void> {
    const values = omitKeys(data, "id");
    if (Object.keys(values).length === 0) return;
    this.db
      .update(eventParticipants)
      .set(values)
      .where(eq(eventParticipants.id, id))
      .run();
  }

  async getParticipants(eventId: number): Promise<DB_EventParticipant[]> {
    return this.db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.event_id, eventId))
      .orderBy(asc(eventParticipants.joined_at))
      .all();
  }

  async getParticipantByUserAndEvent(
    eventId: number,
    userId: string,
    source: string,
  ): Promise<DB_EventParticipant | undefined> {
    return this.db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.event_id, eventId),
          eq(eventParticipants.user_id, userId),
          eq(eventParticipants.source, source),
        ),
      )
      .get();
  }

  async getVoiceParticipantsCount(eventId: number): Promise<number> {
    const row = this.db
      .select({ count: sql<number>`count(*)` })
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.event_id, eventId),
          eq(eventParticipants.source, "voice"),
          isNull(eventParticipants.left_at),
        ),
      )
      .get();
    return row?.count || 0;
  }

  // ── Activities ──

  async addActivity(
    data: Omit<DB_EventActivity, "id">,
  ): Promise<DB_EventActivity> {
    const activity = this.db
      .insert(eventActivities)
      .values({
        event_id: data.event_id,
        name: data.name,
        success_count: data.success_count,
        total_count: data.total_count,
      })
      .returning()
      .get();
    return activity!;
  }

  async updateActivity(
    id: number,
    data: Partial<DB_EventActivity>,
  ): Promise<void> {
    const values = omitKeys(data, "id");
    if (Object.keys(values).length === 0) return;
    this.db
      .update(eventActivities)
      .set(values)
      .where(eq(eventActivities.id, id))
      .run();
  }

  async getActivities(eventId: number): Promise<DB_EventActivity[]> {
    return this.db
      .select()
      .from(eventActivities)
      .where(eq(eventActivities.event_id, eventId))
      .orderBy(asc(eventActivities.id))
      .all();
  }
}
