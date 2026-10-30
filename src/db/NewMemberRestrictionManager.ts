import { and, desc, eq, lte } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import { newMemberRestrictions } from "./schema.js";
import type { DB_NewMemberRestriction } from "./NewMemberRestrictionTypes.js";

export default class NewMemberRestrictionManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async create(
    data: Omit<DB_NewMemberRestriction, "id">,
  ): Promise<DB_NewMemberRestriction> {
    const row = this.db
      .insert(newMemberRestrictions)
      .values({
        user_id: data.user_id,
        server_id: data.server_id,
        role_id: data.role_id,
        assigned_at: data.assigned_at,
        status: data.status || "pending",
      })
      .returning()
      .get();
    return row!;
  }

  async getByUser(
    userId: string,
    serverId: string,
  ): Promise<DB_NewMemberRestriction | undefined> {
    return this.db
      .select()
      .from(newMemberRestrictions)
      .where(
        and(
          eq(newMemberRestrictions.user_id, userId),
          eq(newMemberRestrictions.server_id, serverId),
        ),
      )
      .orderBy(desc(newMemberRestrictions.id))
      .limit(1)
      .get();
  }

  async getPendingExpired(before: string): Promise<DB_NewMemberRestriction[]> {
    return this.db
      .select()
      .from(newMemberRestrictions)
      .where(
        and(
          eq(newMemberRestrictions.status, "pending"),
          lte(newMemberRestrictions.assigned_at, before),
        ),
      )
      .orderBy(newMemberRestrictions.assigned_at)
      .all();
  }

  async markRemoved(id: number): Promise<void> {
    this.db
      .update(newMemberRestrictions)
      .set({ status: "removed" })
      .where(eq(newMemberRestrictions.id, id))
      .run();
  }
}
