import { DB_Logs, DB_Logs_Fetched } from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';

export default class LogManager {
    private db!: SQLiteDatabase

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    public async get(guild_id: string, channel_id?: string, user_id?: string): Promise<DB_Logs_Fetched[] | undefined> {
        if (!guild_id) return

        if (channel_id != undefined && user_id != undefined) {
            return await this.db.all<DB_Logs_Fetched[]>(
                `SELECT 
                chl.name AS channel_name,
                u.username,
                l.creation_date
                FROM logs as l 
                JOIN users AS u ON u.id = l.user_id
                JOIN servers AS s ON s.id = l.server_id 
                JOIN channels AS chl ON chl.id = l.channel_id
                WHERE chl.channel_id = ? AND u.user_id = ? AND s.server_id = ?`,
                channel_id, user_id, guild_id)

        } else if (channel_id != undefined) {
            return await this.db.all<DB_Logs_Fetched[]>(
                `SELECT 
                chl.name AS channel_name,
                u.username,
                l.creation_date
                FROM logs as l 
                JOIN users AS u ON u.id = l.user_id
                JOIN servers AS s ON s.id = l.server_id 
                JOIN channels AS chl ON chl.id = l.channel_id
                WHERE chl.channel_id = ? AND s.server_id = ?`,
                channel_id, guild_id)

        } if (user_id != undefined) {
            return await this.db.all<DB_Logs_Fetched[]>(
                `SELECT 
                chl.name AS channel_name,
                u.username,
                l.creation_date
                FROM logs as l 
                JOIN users AS u ON u.id = l.user_id
                JOIN servers AS s ON s.id = l.server_id 
                JOIN channels AS chl ON chl.id = l.channel_id
                WHERE u.user_id = ? AND s.server_id = ?`,
                user_id, guild_id)

        } else {
            return
        }

    }

    public async create(logData: DB_Logs): Promise<void> {
        await this.db.run(
            `INSERT INTO logs(
                        server_id,
                        user_id,
                        channel_id,
                        interaction,
                        log_type,
                        creation_date) VALUES(?, ?, ?, ?, ?, ?)`,
            logData.server_id,
            logData.user_id,
            logData.channel_id,
            logData.interaction,
            logData.logType,
            logData.creation_date
        )
    }


}
