import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import {
  DB_UserLevel,
  DB_AllLogs,
  DB_LevelLeaderboardEntry,
} from "../../db/Idatabase.js";
import { User, Guild } from "discord.js";
import RewardLevelManager from "./rewardLevelManager.js";
import type { AppDatabase } from "../../db/client.js";
import { levels, logs, servers, users } from "../../db/schema.js";

export default class LevelManager {
  private db: AppDatabase;
  public rewardLevels: RewardLevelManager;
  constructor(db: AppDatabase) {
    this.db = db;
    this.rewardLevels = new RewardLevelManager(this.db);
  }

  public async get(
    user?: User,
    guild?: Guild,
  ): Promise<DB_UserLevel | Promise<DB_UserLevel[]> | undefined> {
    if (user?.id && guild?.id) {
      return this.db
        .select({
          user_id: users.id,
          server_id: servers.id,
          id: levels.id,
          xp: levels.xp,
          level: levels.level,
          last_message: levels.last_message,
        })
        .from(levels)
        .innerJoin(users, eq(users.id, levels.user_id))
        .innerJoin(servers, eq(servers.id, levels.server_id))
        .where(and(eq(users.user_id, user.id), eq(servers.server_id, guild.id)))
        .get();
    }
    return this.db.select().from(levels).all();
  }

  public async create(
    userLevel: DB_UserLevel,
  ): Promise<DB_UserLevel | undefined> {
    this.db
      .insert(levels)
      .values({
        user_id: userLevel.user_id,
        server_id: userLevel.server_id,
        xp: userLevel.xp,
        level: userLevel.level,
        last_message: userLevel.last_message,
      })
      .onConflictDoNothing()
      .run();

    return this.db
      .select()
      .from(levels)
      .where(
        and(
          eq(levels.user_id, userLevel.user_id),
          eq(levels.server_id, userLevel.server_id),
        ),
      )
      .get();
  }

  public async update(userLevel: DB_UserLevel): Promise<void> {
    if (userLevel.id === undefined) return;
    this.db
      .update(levels)
      .set({
        xp: userLevel.xp,
        level: userLevel.level,
        last_message: userLevel.last_message,
      })
      .where(eq(levels.id, userLevel.id))
      .run();
  }

  public async getRank(
    userId: number,
    serverId: number,
  ): Promise<number | null> {
    // Consulta para obtener la posición de un usuario en un servidor
    const result = this.db.get<{ rank: number }>(sql`
      SELECT rank FROM (
        SELECT
          user_id,
          ROW_NUMBER() OVER(ORDER BY xp DESC) as rank
        FROM levels
        WHERE server_id = ${serverId}
      )
      WHERE user_id = ${userId}
    `);

    return result ? result.rank : null;
  }

  public async getLeaderboard(
    serverId: number,
    limit: number,
  ): Promise<DB_LevelLeaderboardEntry[]> {
    return this.db
      .select({
        discord_id: users.user_id,
        username: users.username,
        xp: levels.xp,
        level: levels.level,
      })
      .from(levels)
      .innerJoin(users, eq(users.id, levels.user_id))
      .where(eq(levels.server_id, serverId))
      .orderBy(desc(levels.xp), asc(levels.last_message))
      .limit(limit)
      .all();
  }

  public async getAllLogs(
    timestamp: string,
  ): Promise<DB_AllLogs[] | undefined> {
    return this.db
      .select({
        userDB_id: users.id,
        user_id: users.user_id,
        creation_date: logs.creation_date,
      })
      .from(logs)
      .innerJoin(users, eq(users.id, logs.user_id))
      .where(gte(logs.creation_date, timestamp))
      .orderBy(asc(logs.creation_date))
      .all();
  }
}
