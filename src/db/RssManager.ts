import { Database as SQLiteDatabase } from 'sqlite';
import { DB_RssFeed } from './RssTypes.js';

export default class RssManager {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async create(data: Omit<DB_RssFeed, 'id' | 'created_at'>): Promise<DB_RssFeed> {
    const result = await this.db.run(
      `INSERT INTO rss_feeds (server_id, channel_id, name, url, template, webhook_url, webhook_name, webhook_avatar, last_guid, last_checked, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.server_id,
      data.channel_id,
      data.name,
      data.url,
      data.template,
      data.webhook_url,
      data.webhook_name || '',
      data.webhook_avatar || '',
      data.last_guid || '',
      data.last_checked || '',
      data.created_by,
      data.status || 'active'
    );
    const feed = await this.db.get<DB_RssFeed>(
      `SELECT * FROM rss_feeds WHERE id = ?`,
      result.lastID
    );
    return feed!;
  }

  async get(id: number): Promise<DB_RssFeed | undefined> {
    return this.db.get<DB_RssFeed>(`SELECT * FROM rss_feeds WHERE id = ?`, id);
  }

  async update(id: number, data: Partial<DB_RssFeed>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'created_at') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(id);
    await this.db.run(
      `UPDATE rss_feeds SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run(`UPDATE rss_feeds SET status = 'removed' WHERE id = ?`, id);
  }

  async getByGuild(serverId: string): Promise<DB_RssFeed[]> {
    return this.db.all<DB_RssFeed[]>(
      `SELECT * FROM rss_feeds WHERE server_id = ? ORDER BY created_at ASC`,
      serverId
    );
  }

  async getActive(): Promise<DB_RssFeed[]> {
    return this.db.all<DB_RssFeed[]>(
      `SELECT * FROM rss_feeds WHERE status = 'active' ORDER BY last_checked ASC`
    );
  }
}
