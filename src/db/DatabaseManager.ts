import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase, open } from 'sqlite';
import UserManager from "./userManager.js"
import ServerManager from "./guildManager.js"
import RoleManager from "./RoleManager.js"
import ChannelManager from "./channelManager.js"
import LogsManager from "./logManager.js"
import { DB_ServerSettings } from './Idatabase.js'


export default class DatabaseManager {
    private db!: SQLiteDatabase;

    users: UserManager;
    guild: ServerManager;
    roles: RoleManager;
    channels: ChannelManager;
    logs: LogsManager;

    constructor(private dbPath: string) { }


    private instance() {
        this.users = new UserManager(this.db)
        this.guild = new ServerManager(this.db, this)
        this.roles = new RoleManager(this.db, this)
        this.channels = new ChannelManager(this.db)
        this.logs = new LogsManager(this.db)
    }

    /**
     * Conecta a la base de datos.
     * @returns {Promise<void>}
     */
    public async connect(): Promise<void> {
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });
        this.instance()
        console.log('Conectado a la base de datos SQLite.');
        await this.createTables()
    }

    private async createTables() {
        const queries = [
            // USERS
            this.db.run(
                `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL UNIQUE,
                username VARCHAR NOT NULL
            );`
            ),
            // SERVERS
            this.db.run(
                `CREATE TABLE IF NOT EXISTS servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id TEXT NOT NULL UNIQUE,
                name VARCHAR NOT NULL,
                owner_id INTEGER,
                creation_date TEXT NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
            );`
            ),
            //ROLES
            this.db.run(
                `CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role_id TEXT NOT NULL UNIQUE,
                server_id INTEGER NOT NULL,
                name VARCHAR NOT NULL,
                FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
            );`
            ),
            //CUSTOM ROLES
            this.db.run(
                `CREATE TABLE IF NOT EXISTS customRoles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                server_id INTEGER NOT NULL,
                role_id INTEGER NOT NULL,
                FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            );`
            ),
            // LOGS 
            this.db.run(
                `CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id INTEGER NOT NULL,
                channel_id INTEGER,
                user_id INTEGER NOT NULL,
                interaction TEXT NOT NULL,
                log_type TEXT NOT NULL,
                creation_date TEXT NOT NULL,
                FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
                FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`
            )
        ]
        await Promise.all(queries)
    }
    /**
     * Obtiene la configuración de un servidor por su ID interno.
     * @param {number} serverId - ID interno del servidor.
     * @returns {Promise<ServerSettings | undefined>}
     */
    public async getServerSettings(serverId: number): Promise<DB_ServerSettings | undefined> {
        return await this.db.get<DB_ServerSettings>(`SELECT * FROM server_settings WHERE server_id = ?`, serverId);
    }

    /**
     * Actualiza o inserta la configuración de un servidor.
     * @param {ServerSettings} settings - Datos de configuración.
     * @returns {Promise<void>}
     */
    public async upsertServerSettings(settings: DB_ServerSettings): Promise<void> {
        await this.db.run(
            `INSERT OR REPLACE INTO server_settings (server_id, prefix) VALUES (?, ?)`,
            settings.server_id,
            settings.prefix
        );
    }

    public async close(): Promise<void> {
        await this.db.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}
