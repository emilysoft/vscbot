import { DB_Channel, SearchData } from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';

export default class ChannelManager {

    private db!: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    public async create(channel: DB_Channel): Promise<DB_Channel | undefined> {
        const result = await this.db.run(
            `INSERT INTO channels 
            (channel_id, server_id, name) VALUES (?, ?, ?)`,
            channel.channel_id,
            channel.server_id,
            channel.name
        );

        return await this.get({ id: result.lastID }) as DB_Channel;
    }

    public async get(data: SearchData): Promise<DB_Channel | DB_Channel[] | undefined> {
        if (data.item_id) {
            return await this.db.get<DB_Channel>(`SELECT * FROM channels WHERE channel_id = ?`, data.item_id)
        } else if (data.id) {
            return await this.db.get<DB_Channel>(`SELECT * FROM channels WHERE id = ?`, data.id)
        } else {
            return await this.db.all<DB_Channel[]>(`SELECT * FROM channels`)
        }
    }
}
