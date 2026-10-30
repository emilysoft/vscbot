import { eq } from "drizzle-orm";
import { DB_User, DB_Server } from "./Idatabase.js";
import DatabaseManager from "./DatabaseManager.js";
import { Guild, User } from "discord.js";
import type { AppDatabase } from "./client.js";
import { servers } from "./schema.js";

export default class ServerManager {
  private db: AppDatabase;
  databaseManager: DatabaseManager;

  constructor(db: AppDatabase, databaseManager: DatabaseManager) {
    this.db = db;
    this.databaseManager = databaseManager;
  }

  public async get(guild: Guild): Promise<DB_Server | undefined> {
    return this.db
      .select()
      .from(servers)
      .where(eq(servers.server_id, guild.id))
      .get();
  }

  public async create(
    server: Guild,
    owner: User,
  ): Promise<DB_Server | undefined> {
    const owner_db = (await this.databaseManager.users.get(owner)) as DB_User;
    if (!owner_db.id)
      throw new Error(
        "error al encontrar el owner para poder crear una fila server",
      );

    const inserted = this.db
      .insert(servers)
      .values({
        server_id: server.id,
        name: server.name,
        owner_id: owner_db.id,
        creation_date: server.createdAt.toString(),
      })
      .onConflictDoNothing({ target: servers.server_id })
      .returning()
      .get();
    if (inserted) return inserted;

    return this.db
      .select()
      .from(servers)
      .where(eq(servers.server_id, server.id))
      .get();
  }
}
