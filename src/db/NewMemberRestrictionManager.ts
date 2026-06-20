import { Database as SQLiteDatabase } from 'sqlite';
import { DB_NewMemberRestriction } from './NewMemberRestrictionTypes.js';

export default class NewMemberRestrictionManager {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async create(data: Omit<DB_NewMemberRestriction, 'id'>): Promise<DB_NewMemberRestriction> {
    const result = await this.db.run(
      `INSERT INTO new_member_restrictions (user_id, server_id, role_id, assigned_at, status)
       VALUES (?, ?, ?, ?, ?)`,
      data.user_id,
      data.server_id,
      data.role_id,
      data.assigned_at,
      data.status || 'pending'
    );
    const row = await this.db.get<DB_NewMemberRestriction>(
      `SELECT * FROM new_member_restrictions WHERE id = ?`,
      result.lastID
    );
    return row!;
  }

  async getByUser(userId: string, serverId: string): Promise<DB_NewMemberRestriction | undefined> {
    return this.db.get<DB_NewMemberRestriction>(
      `SELECT * FROM new_member_restrictions WHERE user_id = ? AND server_id = ? ORDER BY id DESC LIMIT 1`,
      userId,
      serverId
    );
  }

  async getPendingExpired(before: string): Promise<DB_NewMemberRestriction[]> {
    return this.db.all<DB_NewMemberRestriction[]>(
      `SELECT * FROM new_member_restrictions WHERE status = 'pending' AND assigned_at <= ? ORDER BY assigned_at ASC`,
      before
    );
  }

  async markRemoved(id: number): Promise<void> {
    await this.db.run(`UPDATE new_member_restrictions SET status = 'removed' WHERE id = ?`, id);
  }
}
