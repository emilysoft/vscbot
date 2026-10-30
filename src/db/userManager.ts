import { eq } from "drizzle-orm";
import { User } from "discord.js";
import { DB_User } from "./Idatabase.js";
import type { AppDatabase } from "./client.js";
import { users } from "./schema.js";

export default class UserManager {
  private db: AppDatabase;
  update: UserUpdate;

  constructor(db: AppDatabase) {
    this.db = db;
    this.update = new UserUpdate(this.db);
  }

  public async get(
    user?: User,
  ): Promise<DB_User | Promise<DB_User[]> | undefined> {
    if (user) {
      const result = this.db
        .select()
        .from(users)
        .where(eq(users.user_id, user.id))
        .get();
      return result ? result : await this.create(user);
    }
    return this.db.select().from(users).all();
  }

  private async create(user: User): Promise<DB_User | undefined> {
    const inserted = this.db
      .insert(users)
      .values({ user_id: user.id, username: user.username })
      .onConflictDoNothing({ target: users.user_id })
      .returning()
      .get();
    if (inserted) return inserted;

    // Carrera con otra inserción: la fila ya existe.
    return this.db.select().from(users).where(eq(users.user_id, user.id)).get();
  }

  public async remove(user_id: string): Promise<void> {
    this.db.delete(users).where(eq(users.user_id, user_id)).run();
  }
}

class UserUpdate {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }
  public async username(user: DB_User): Promise<void> {
    if (user.id === undefined) throw new Error("usuario sin id interno");
    this.db
      .update(users)
      .set({ username: user.username })
      .where(eq(users.id, user.id))
      .run();
  }
}
