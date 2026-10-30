import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import { mudaeActivity, mudaeResetConfig } from "./schema.js";
import type { DB_MudaeActivity, DB_MudaeResetConfig } from "./MudaeTypes.js";
import { omitKeys } from "./helpers.js";

export default class MudaeResetManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  public async upsertConfig(data: DB_MudaeResetConfig): Promise<void> {
    this.db
      .insert(mudaeResetConfig)
      .values({
        server_id: data.server_id,
        channel_id: data.channel_id,
        output_channel_id: data.output_channel_id,
        game_name: data.game_name,
        restore_value: data.restore_value,
        interval_days: data.interval_days,
        active_days: data.active_days,
        min_messages: data.min_messages,
        auto_send: data.auto_send,
        enabled: data.enabled,
        last_run_at: data.last_run_at,
        created_at: data.created_at,
      })
      .onConflictDoUpdate({
        target: mudaeResetConfig.server_id,
        set: {
          channel_id: data.channel_id,
          output_channel_id: data.output_channel_id,
          game_name: data.game_name,
          restore_value: data.restore_value,
          interval_days: data.interval_days,
          active_days: data.active_days,
          min_messages: data.min_messages,
          auto_send: data.auto_send,
          enabled: data.enabled,
          last_run_at: data.last_run_at,
          created_at: data.created_at,
        },
      })
      .run();
  }

  public async getConfig(
    serverId: string,
  ): Promise<DB_MudaeResetConfig | undefined> {
    return this.db
      .select()
      .from(mudaeResetConfig)
      .where(eq(mudaeResetConfig.server_id, serverId))
      .get();
  }

  public async getAllEnabled(): Promise<DB_MudaeResetConfig[]> {
    return this.db
      .select()
      .from(mudaeResetConfig)
      .where(eq(mudaeResetConfig.enabled, true))
      .all();
  }

  public async update(
    serverId: string,
    data: Partial<DB_MudaeResetConfig>,
  ): Promise<void> {
    const values = omitKeys(data, "server_id", "created_at");
    if (Object.keys(values).length === 0) return;
    this.db
      .update(mudaeResetConfig)
      .set(values)
      .where(eq(mudaeResetConfig.server_id, serverId))
      .run();
  }

  public async delete(serverId: string): Promise<void> {
    // El canal debe leerse antes de borrar la configuración (la fila desaparece).
    this.db.transaction((tx) => {
      const config = tx
        .select({ channel_id: mudaeResetConfig.channel_id })
        .from(mudaeResetConfig)
        .where(eq(mudaeResetConfig.server_id, serverId))
        .get();

      if (config) {
        tx.delete(mudaeActivity)
          .where(eq(mudaeActivity.channel_id, config.channel_id))
          .run();
      }

      tx.delete(mudaeResetConfig)
        .where(eq(mudaeResetConfig.server_id, serverId))
        .run();
    });
  }

  public async upsertActivity(
    userId: string,
    channelId: string,
    lastMessage: string,
  ): Promise<void> {
    this.db
      .insert(mudaeActivity)
      .values({
        user_id: userId,
        channel_id: channelId,
        last_message: lastMessage,
        msg_count: 1,
      })
      .onConflictDoUpdate({
        target: [mudaeActivity.user_id, mudaeActivity.channel_id],
        set: {
          last_message: sql`excluded.last_message`,
          msg_count: sql`${mudaeActivity.msg_count} + 1`,
        },
      })
      .run();
  }

  public async getUsersAfter(
    channelId: string,
    cutoffISO: string,
  ): Promise<DB_MudaeActivity[]> {
    return this.db
      .select()
      .from(mudaeActivity)
      .where(
        and(
          eq(mudaeActivity.channel_id, channelId),
          gte(mudaeActivity.last_message, cutoffISO),
        ),
      )
      .orderBy(desc(mudaeActivity.last_message))
      .all();
  }

  public async getActiveUsers(
    channelId: string,
    cutoffISO: string,
    minMessages: number,
  ): Promise<DB_MudaeActivity[]> {
    return this.db
      .select()
      .from(mudaeActivity)
      .where(
        and(
          eq(mudaeActivity.channel_id, channelId),
          or(
            gte(mudaeActivity.last_message, cutoffISO),
            gte(mudaeActivity.msg_count, minMessages),
          ),
        ),
      )
      .orderBy(desc(mudaeActivity.last_message))
      .all();
  }

  public async resetMsgCounts(channelId: string): Promise<void> {
    this.db
      .update(mudaeActivity)
      .set({ msg_count: 0 })
      .where(eq(mudaeActivity.channel_id, channelId))
      .run();
  }

  public async getActivity(channelId: string): Promise<DB_MudaeActivity[]> {
    return this.db
      .select()
      .from(mudaeActivity)
      .where(eq(mudaeActivity.channel_id, channelId))
      .orderBy(desc(mudaeActivity.last_message))
      .all();
  }

  public async getOwnChannelIds(): Promise<string[]> {
    const rows = this.db
      .selectDistinct({ channel_id: mudaeResetConfig.channel_id })
      .from(mudaeResetConfig)
      .where(eq(mudaeResetConfig.enabled, true))
      .all();
    return rows.map((r) => r.channel_id);
  }
}
