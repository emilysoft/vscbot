// gestor de premios (los roles de niveles)
import { and, eq } from "drizzle-orm";
import { DB_RewardRoles, DB_Server } from "../../db/Idatabase.js";
import type { AppDatabase } from "../../db/client.js";
import { rewardRoles } from "../../db/schema.js";

export default class RewardLevelManager {
  private db: AppDatabase;
  constructor(db: AppDatabase) {
    this.db = db;
  }

  public async get(
    level: number,
    server: DB_Server,
  ): Promise<DB_RewardRoles | undefined> {
    if (level && server?.id) {
      return this.db
        .select()
        .from(rewardRoles)
        .where(
          and(
            eq(rewardRoles.level, level),
            eq(rewardRoles.server_id, server.id),
          ),
        )
        .get();
    }
    return undefined;
  }

  public async getAll(
    server_id: number,
  ): Promise<DB_RewardRoles[] | undefined> {
    return this.db
      .select()
      .from(rewardRoles)
      .where(eq(rewardRoles.server_id, server_id))
      .all();
  }

  public async create(rewardRole: DB_RewardRoles): Promise<void> {
    this.db
      .insert(rewardRoles)
      .values({
        role_id: rewardRole.role_id,
        level: rewardRole.level,
        server_id: rewardRole.server_id,
      })
      .run();
  }

  public async update(rewardRole: DB_RewardRoles): Promise<void> {
    this.db
      .update(rewardRoles)
      .set({ role_id: rewardRole.role_id })
      .where(
        and(
          eq(rewardRoles.server_id, rewardRole.server_id),
          eq(rewardRoles.level, rewardRole.level),
        ),
      )
      .run();
  }
}
