import { eq } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import { rssFeeds } from "./schema.js";
import type { DB_RssFeed } from "./RssTypes.js";
import { omitKeys } from "./helpers.js";

export default class RssManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async create(
    data: Omit<DB_RssFeed, "id" | "created_at">,
  ): Promise<DB_RssFeed> {
    const feed = this.db
      .insert(rssFeeds)
      .values({
        server_id: data.server_id,
        channel_id: data.channel_id,
        name: data.name,
        url: data.url,
        template: data.template,
        webhook_url: data.webhook_url,
        webhook_name: data.webhook_name || "",
        webhook_avatar: data.webhook_avatar || "",
        last_guid: data.last_guid || "",
        last_checked: data.last_checked || "",
        created_by: data.created_by,
        status: data.status || "active",
      })
      .returning()
      .get();
    return feed!;
  }

  async get(id: number): Promise<DB_RssFeed | undefined> {
    return this.db.select().from(rssFeeds).where(eq(rssFeeds.id, id)).get();
  }

  async update(id: number, data: Partial<DB_RssFeed>): Promise<void> {
    const values = omitKeys(data, "id", "created_at");
    if (Object.keys(values).length === 0) return;
    this.db.update(rssFeeds).set(values).where(eq(rssFeeds.id, id)).run();
  }

  async delete(id: number): Promise<void> {
    this.db
      .update(rssFeeds)
      .set({ status: "removed" })
      .where(eq(rssFeeds.id, id))
      .run();
  }

  async getByGuild(serverId: string): Promise<DB_RssFeed[]> {
    return this.db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.server_id, serverId))
      .orderBy(rssFeeds.created_at)
      .all();
  }

  async getActive(): Promise<DB_RssFeed[]> {
    return this.db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.status, "active"))
      .orderBy(rssFeeds.last_checked)
      .all();
  }
}
