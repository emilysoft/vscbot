import { DB_User } from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';

export default class UserManager {
    private db!: SQLiteDatabase
    update: UserUpdate

    constructor(db: SQLiteDatabase) {
        this.db = db;
        this.update = new UserUpdate(this.db);
    }

    public async get(user_id?: string): Promise<DB_User | Promise<DB_User[]> | undefined> {
        if (user_id) {
            return await this.db.get<DB_User>(`SELECT * FROM users WHERE user_id = ?`, user_id)
        } else {
            return await this.db.all<DB_User[]>(`SELECT * FROM users`)
        }
    }

    public async create(user: DB_User): Promise<DB_User | undefined> {
        const result = await this.db.run(
            `INSERT INTO users (user_id, username) VALUES (?, ?)`,
            user.user_id,
            user.username,
        );
        return await this.db.get<DB_User>(`SELECT * FROM users WHERE id = ?`, result.lastID)
    }

    // dont use this if is unnesecesary
    public async remove(user_id: string): Promise<void> {
        await this.db.run(`DELETE FROM users WHERE user_id = ?`, user_id);
    }
}

class UserUpdate {
    private db!: SQLiteDatabase

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }
    public async username(user: DB_User): Promise<void> {
        await this.db.run(
            `UPDATE users SET username = ?, WHERE id = ?`,
            user.username,
            user.id
        );
    }
}
