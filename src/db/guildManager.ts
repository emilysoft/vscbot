import { DB_User, DB_Server } from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import DatabaseManager from "./DatabaseManager.js"
import { Guild, User } from "discord.js"

export default class ServerManager {
    private db!: SQLiteDatabase
    databaseManager: DatabaseManager

    constructor(db: SQLiteDatabase, databaseManager: DatabaseManager) {
        this.db = db;
        this.databaseManager = databaseManager
    }

    public async get(guild: Guild, owner: User): Promise<DB_Server | DB_Server[] | undefined> {
        if (guild.id) {
            const result = await this.db.get<DB_Server>(`SELECT * FROM servers WHERE server_id = ?`, guild.id)
            if(result == undefined) {
                return await this.create(guild, owner)
            }
        } else {
            return await this.db.all<DB_Server[]>(`SELECT * FROM servers`)
        }
    }

    private async create(server: Guild, owner: User): Promise<DB_Server | undefined> {
        const owner_db = await this.databaseManager.users.get(owner) as DB_User
        if(!owner_db.id) throw new Error("error al encontrar el owner para poder crear una fila server")
        const result = await this.db.run(
            `INSERT INTO servers (server_id, name, owner_id, creation_date) VALUES (?, ?, ?, ?)`,
            server.id,
            server.name,
            owner_db.id,
            server.createdAt.toString()
        );
        return await this.db.get<DB_Server>(
            `SELECT * FROM servers WHERE id = ?`, result.lastID
        )
    }
}
