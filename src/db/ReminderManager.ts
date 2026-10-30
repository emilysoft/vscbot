import { and, eq, lte } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import { reminders } from "./schema.js";
import type { DB_Reminder } from "./ReminderTypes.js";
import { omitKeys } from "./helpers.js";

export default class ReminderManager {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async create(
    data: Omit<DB_Reminder, "id" | "created_at">,
  ): Promise<DB_Reminder> {
    const reminder = this.db
      .insert(reminders)
      .values({
        server_id: data.server_id,
        channel_id: data.channel_id,
        message: data.message,
        remind_at: data.remind_at,
        created_by: data.created_by,
        status: data.status || "pending",
        recurring: data.recurring || false,
      })
      .returning()
      .get();
    return reminder!;
  }

  async get(id: number): Promise<DB_Reminder | undefined> {
    return this.db.select().from(reminders).where(eq(reminders.id, id)).get();
  }

  async update(id: number, data: Partial<DB_Reminder>): Promise<void> {
    const values = omitKeys(data, "id");
    if (Object.keys(values).length === 0) return;
    this.db.update(reminders).set(values).where(eq(reminders.id, id)).run();
  }

  async delete(id: number): Promise<void> {
    this.db.delete(reminders).where(eq(reminders.id, id)).run();
  }

  async cancel(id: number): Promise<void> {
    this.db
      .update(reminders)
      .set({ status: "cancelled" })
      .where(eq(reminders.id, id))
      .run();
  }

  async getByGuild(serverId: string): Promise<DB_Reminder[]> {
    return this.db
      .select()
      .from(reminders)
      .where(eq(reminders.server_id, serverId))
      .orderBy(reminders.remind_at)
      .all();
  }

  async getByStatus(status: string): Promise<DB_Reminder[]> {
    return this.db
      .select()
      .from(reminders)
      .where(eq(reminders.status, status))
      .orderBy(reminders.remind_at)
      .all();
  }

  async getPendingBefore(before: string): Promise<DB_Reminder[]> {
    return this.db
      .select()
      .from(reminders)
      .where(
        and(eq(reminders.status, "pending"), lte(reminders.remind_at, before)),
      )
      .orderBy(reminders.remind_at)
      .all();
  }

  async markSent(id: number): Promise<void> {
    this.db
      .update(reminders)
      .set({ status: "sent" })
      .where(eq(reminders.id, id))
      .run();
  }
}
