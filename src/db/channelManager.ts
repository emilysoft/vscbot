import { DB_Channel } from "./Idatabase.js";
import { Database as SQLiteDatabase } from "sqlite";
import { TextChannel } from "discord.js";

export default class ChannelManager {
  private db!: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  public async get(
    channel: TextChannel,
    server_id: number,
    id?: number,
  ): Promise<DB_Channel | DB_Channel[] | undefined> {
    if (channel) {
      const result = await this.db.get<DB_Channel>(
        `SELECT * FROM channels WHERE channel_id = ?`,
        channel.id,
      );
      if (result == undefined) {
        return await this.create(channel, server_id);
      }
      return result;
    } else if (id) {
      return await this.db.get<DB_Channel>(
        `SELECT * FROM channels WHERE id = ?`,
        id,
      );
    } else {
      return await this.db.all<DB_Channel[]>(`SELECT * FROM channels`);
    }
  }

  private async create(
    channel: TextChannel,
    server_id: number,
  ): Promise<DB_Channel | undefined> {
    await this.db.run(
      `INSERT OR IGNORE INTO channels
      (channel_id, name, server_id) VALUES (?, ?, ?)`,
      channel.id,
      channel.name,
      server_id,
    );

    return await this.db.get<DB_Channel>(
      `SELECT * FROM channels WHERE channel_id = ?`,
      channel.id,
    );
  }
}
