import { DB_User } from "./Idatabase.js";
import { Database as SQLiteDatabase } from "sqlite";
import { User } from "discord.js";
export default class UserManager {
  private db!: SQLiteDatabase;
  update: UserUpdate;

  constructor(db: SQLiteDatabase) {
    this.db = db;
    this.update = new UserUpdate(this.db);
  }

  public async get(
    user?: User,
  ): Promise<DB_User | Promise<DB_User[]> | undefined> {
    if (user) {
      const result = await this.db.get<DB_User>(
        `SELECT * FROM users WHERE user_id = ?`,
        user.id,
      );
      return result ? result : await this.create(user);
    } else {
      return await this.db.all<DB_User[]>(`SELECT * FROM users`);
    }
  }

  private async create(user: User): Promise<DB_User | undefined> {
    await this.db.run(
      `INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)`,
      user.id,
      user.username,
    );
    return await this.db.get<DB_User>(
      `SELECT * FROM users WHERE user_id = ?`,
      user.id,
    );
  }

  public async remove(user_id: string): Promise<void> {
    await this.db.run(`DELETE FROM users WHERE user_id = ?`, user_id);
  }
}

class UserUpdate {
  private db!: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }
  public async username(user: DB_User): Promise<void> {
    await this.db.run(
      `UPDATE users SET username = ? WHERE id = ?`,
      user.username,
      user.id,
    );
  }
}
