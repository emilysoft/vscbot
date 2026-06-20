import { Database as SQLiteDatabase } from 'sqlite';
import { DB_Reminder } from './ReminderTypes.js';

export default class ReminderManager {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async create(data: Omit<DB_Reminder, 'id' | 'created_at'>): Promise<DB_Reminder> {
    const result = await this.db.run(
      `INSERT INTO reminders (server_id, channel_id, message, remind_at, created_by, status, recurring)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.server_id,
      data.channel_id,
      data.message,
      data.remind_at,
      data.created_by,
      data.status || 'pending',
      data.recurring || 0
    );
    const reminder = await this.db.get<DB_Reminder>(
      `SELECT * FROM reminders WHERE id = ?`,
      result.lastID
    );
    return reminder!;
  }

  async get(id: number): Promise<DB_Reminder | undefined> {
    return this.db.get<DB_Reminder>(`SELECT * FROM reminders WHERE id = ?`, id);
  }

  async update(id: number, data: Partial<DB_Reminder>): Promise<void> {
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
      `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run(`DELETE FROM reminders WHERE id = ?`, id);
  }

  async cancel(id: number): Promise<void> {
    await this.db.run(`UPDATE reminders SET status = 'cancelled' WHERE id = ?`, id);
  }

  async getByGuild(serverId: string): Promise<DB_Reminder[]> {
    return this.db.all<DB_Reminder[]>(
      `SELECT * FROM reminders WHERE server_id = ? ORDER BY remind_at ASC`,
      serverId
    );
  }

  async getByStatus(status: string): Promise<DB_Reminder[]> {
    return this.db.all<DB_Reminder[]>(
      `SELECT * FROM reminders WHERE status = ? ORDER BY remind_at ASC`,
      status
    );
  }

  async getPendingBefore(before: string): Promise<DB_Reminder[]> {
    return this.db.all<DB_Reminder[]>(
      `SELECT * FROM reminders WHERE status = 'pending' AND remind_at <= ? ORDER BY remind_at ASC`,
      before
    );
  }

  async markSent(id: number): Promise<void> {
    await this.db.run(`UPDATE reminders SET status = 'sent' WHERE id = ?`, id);
  }
}
