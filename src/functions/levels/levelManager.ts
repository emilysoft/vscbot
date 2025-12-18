import { DB_UserLevel } from '../../db/Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import { User, Guild} from "discord.js"

export default class LevelManager {
    private db!: SQLiteDatabase

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    public async get(user:User, guild: Guild): Promise<DB_UserLevel | Promise<DB_UserLevel[]> | undefined> {
        if (user.id && guild.id) {
            return await this.db.get<DB_UserLevel>(`
                SELECT
                u.id AS user_id,
                s.id AS server_id,
                l.xp AS total_xp,
                l.level,
                l.last_message
                FROM levels AS l
                JOIN users AS u ON u.id = l.user_id
                JOIN servers AS s ON s.id = l.server_id
                WHERE u.user_id = ? AND s.server_id = ?`, user.id, guild.id)
        } else {
            return await this.db.all<DB_UserLevel[]>(`SELECT * FROM levels`)
        }
    }

    public async create(userLevel:DB_UserLevel): Promise<DB_UserLevel | undefined> {
        const result = await this.db.run(
            `INSERT INTO levels (user_id, server_id, total_xp, level, last_message) VALUES (?, ?, ?, ?, ?)`,
            userLevel.user_id,
            userLevel.server_id,
            userLevel.total_xp,
            userLevel.level,
            userLevel.last_message
        );
        return await this.db.get<DB_UserLevel>(`SELECT * FROM users WHERE id = ?`, result.lastID)
    }

    //public async update(userLevelDB: DB_UserLevel): Promise<void> {
    //    //await this.db.run(`DELETE FROM users WHERE user_id = ?`, user_id);
    //}

    // dont use this if is unnesecesary
    //public async remove(user_id: string): Promise<void> {
    //    await this.db.run(`DELETE FROM users WHERE user_id = ?`, user_id);
    //}
}
