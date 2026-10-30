import { and, desc, eq, max } from "drizzle-orm";
import { DB_Logs, DB_Logs_Fetched } from "./Idatabase.js";
import type { AppDatabase } from "./client.js";
import { channels, logs, servers, users } from "./schema.js";

const LIST_LIMIT = 500;

export default class LogManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  public async get(
    guild_id: string,
    channel_id?: string,
    user_id?: string,
  ): Promise<DB_Logs_Fetched[] | undefined> {
    if (!guild_id) return;

    const query = this.db
      .select({
        channel_name: channels.name,
        username: users.username,
        creation_date: logs.creation_date,
      })
      .from(logs)
      .innerJoin(users, eq(users.id, logs.user_id))
      .innerJoin(servers, eq(servers.id, logs.server_id))
      .innerJoin(channels, eq(channels.id, logs.channel_id));

    if (channel_id != undefined && user_id != undefined) {
      return query
        .where(
          and(
            eq(channels.channel_id, channel_id),
            eq(users.user_id, user_id),
            eq(servers.server_id, guild_id),
          ),
        )
        .orderBy(desc(logs.creation_date))
        .limit(LIST_LIMIT)
        .all();
    }

    if (channel_id != undefined) {
      return query
        .where(
          and(
            eq(channels.channel_id, channel_id),
            eq(servers.server_id, guild_id),
          ),
        )
        .orderBy(desc(logs.creation_date))
        .limit(LIST_LIMIT)
        .all();
    }

    if (user_id != undefined) {
      return query
        .where(and(eq(users.user_id, user_id), eq(servers.server_id, guild_id)))
        .orderBy(desc(logs.creation_date))
        .limit(LIST_LIMIT)
        .all();
    }

    return;
  }

  public async create(logData: DB_Logs): Promise<void> {
    this.db
      .insert(logs)
      .values({
        server_id: logData.server_id,
        user_id: logData.user_id,
        channel_id: logData.channel_id,
        interaction: logData.interaction,
        log_type: logData.logType,
        creation_date: logData.creation_date,
      })
      .run();
  }

  public async getLastMessageDate(
    userId: string,
    guildId: string,
  ): Promise<string | undefined> {
    const row = this.db
      .select({ creation_date: max(logs.creation_date) })
      .from(logs)
      .innerJoin(users, eq(users.id, logs.user_id))
      .innerJoin(servers, eq(servers.id, logs.server_id))
      .where(
        and(
          eq(users.user_id, userId),
          eq(servers.server_id, guildId),
          eq(logs.log_type, "MESSAGE CREATED"),
        ),
      )
      .get();
    return row?.creation_date ?? undefined;
  }
}
