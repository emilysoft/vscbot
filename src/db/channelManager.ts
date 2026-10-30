import { eq } from "drizzle-orm";
import { DB_Channel } from "./Idatabase.js";
import { TextChannel } from "discord.js";
import type { AppDatabase } from "./client.js";
import { channels } from "./schema.js";

export default class ChannelManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  public async get(
    channel: TextChannel,
    server_id: number,
    id?: number,
  ): Promise<DB_Channel | DB_Channel[] | undefined> {
    if (channel) {
      const result = this.db
        .select()
        .from(channels)
        .where(eq(channels.channel_id, channel.id))
        .get();
      if (result == undefined) {
        return await this.create(channel, server_id);
      }
      return result;
    } else if (id) {
      return this.db.select().from(channels).where(eq(channels.id, id)).get();
    } else {
      return this.db.select().from(channels).all();
    }
  }

  private async create(
    channel: TextChannel,
    server_id: number,
  ): Promise<DB_Channel | undefined> {
    const inserted = this.db
      .insert(channels)
      .values({
        channel_id: channel.id,
        name: channel.name,
        server_id,
      })
      .onConflictDoNothing({ target: channels.channel_id })
      .returning()
      .get();
    if (inserted) return inserted;

    return this.db
      .select()
      .from(channels)
      .where(eq(channels.channel_id, channel.id))
      .get();
  }
}
