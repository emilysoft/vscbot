import { Database as SQLiteDatabase } from "sqlite";
import { DB_MudaeActivity, DB_MudaeResetConfig } from "./MudaeTypes.js";

export default class MudaeResetManager {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  public async upsertConfig(data: DB_MudaeResetConfig): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO mudae_reset_config
       (server_id, channel_id, output_channel_id, game_name, restore_value, interval_days, active_days, min_messages, auto_send, enabled, last_run_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.server_id,
      data.channel_id,
      data.output_channel_id,
      data.game_name,
      data.restore_value,
      data.interval_days,
      data.active_days,
      data.min_messages,
      data.auto_send,
      data.enabled,
      data.last_run_at,
      data.created_at,
    );
  }

  public async getConfig(serverId: string): Promise<DB_MudaeResetConfig | undefined> {
    return this.db.get<DB_MudaeResetConfig>(
      `SELECT * FROM mudae_reset_config WHERE server_id = ?`,
      serverId,
    );
  }

  public async getAllEnabled(): Promise<DB_MudaeResetConfig[]> {
    return this.db.all<DB_MudaeResetConfig[]>(
      `SELECT * FROM mudae_reset_config WHERE enabled = 1`,
    );
  }

  public async update(serverId: string, data: Partial<DB_MudaeResetConfig>): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === "server_id" || key === "created_at") continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(serverId);
    await this.db.run(
      `UPDATE mudae_reset_config SET ${fields.join(", ")} WHERE server_id = ?`,
      ...values,
    );
  }

  public async delete(serverId: string): Promise<void> {
    await this.db.run(`DELETE FROM mudae_reset_config WHERE server_id = ?`, serverId);
    await this.db.run(
      `DELETE FROM mudae_activity WHERE channel_id IN (SELECT channel_id FROM mudae_reset_config WHERE server_id = ?)`,
      serverId,
    );
  }

  public async upsertActivity(userId: string, channelId: string, lastMessage: string): Promise<void> {
    await this.db.run(
      `INSERT INTO mudae_activity (user_id, channel_id, last_message, msg_count) VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, channel_id) DO UPDATE SET last_message = excluded.last_message, msg_count = mudae_activity.msg_count + 1`,
      userId,
      channelId,
      lastMessage,
    );
  }

  public async getUsersAfter(channelId: string, cutoffISO: string): Promise<DB_MudaeActivity[]> {
    return this.db.all<DB_MudaeActivity[]>(
      `SELECT * FROM mudae_activity
       WHERE channel_id = ? AND last_message >= ?
       ORDER BY last_message DESC`,
      channelId,
      cutoffISO,
    );
  }

  public async getActiveUsers(
    channelId: string,
    cutoffISO: string,
    minMessages: number,
  ): Promise<DB_MudaeActivity[]> {
    return this.db.all<DB_MudaeActivity[]>(
      `SELECT * FROM mudae_activity
       WHERE channel_id = ? AND (last_message >= ? OR msg_count >= ?)
       ORDER BY last_message DESC`,
      channelId,
      cutoffISO,
      minMessages,
    );
  }

  public async resetMsgCounts(channelId: string): Promise<void> {
    await this.db.run(
      `UPDATE mudae_activity SET msg_count = 0 WHERE channel_id = ?`,
      channelId,
    );
  }

  public async getActivity(channelId: string): Promise<DB_MudaeActivity[]> {
    return this.db.all<DB_MudaeActivity[]>(
      `SELECT * FROM mudae_activity WHERE channel_id = ? ORDER BY last_message DESC`,
      channelId,
    );
  }

  public async getOwnChannelIds(): Promise<string[]> {
    const rows = await this.db.all<{ channel_id: string }[]>(
      `SELECT DISTINCT channel_id FROM mudae_reset_config WHERE enabled = 1`,
    );
    return rows.map(r => r.channel_id);
  }
}
