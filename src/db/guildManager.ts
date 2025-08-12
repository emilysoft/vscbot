import { DB_Server } from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import DatabaseManager from "./DatabaseManager.js"
export default class ServerManager {
    private db!: SQLiteDatabase
    databaseManager: DatabaseManager

    constructor(db: SQLiteDatabase, databaseManager: DatabaseManager) {
        this.db = db;
        this.databaseManager = databaseManager
    }

    public async create(server: DB_Server): Promise<DB_Server | undefined> {
        const result = await this.db.run(
            `INSERT INTO servers (server_id, name, owner_id, creation_date) VALUES (?, ?, ?, ?)`,
            server.server_id,
            server.name,
            server.owner_id,
            server.creation_date
        );
        return await this.db.get<DB_Server>(
            `SELECT * FROM servers WHERE id = ?`, result.lastID
        )
    }

    public async get(server_id: string): Promise<DB_Server | DB_Server[] | undefined> {
        if (server_id) {
            return await this.db.get<DB_Server>(`SELECT * FROM servers WHERE server_id = ?`, server_id)
        } else {
            return await this.db.all<DB_Server[]>(`SELECT * FROM servers`)
        }
    }
}

