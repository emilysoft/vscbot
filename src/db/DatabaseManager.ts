import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase, open } from 'sqlite';
import UserManager from "./userManager.js"
import ServerManager from "./guildManager.js"
import RoleManager from "./RoleManager.js"
import ChannelManager from "./channelManager.js"
import LogsManager from "./logManager.js"
import { DB_ServerSettings } from './Idatabase.js'
import LevelManager from "../functions/levels/levelManager.js"
import EventManager from "./EventManager.js"

export default class DatabaseManager {
  private db!: SQLiteDatabase;

  users: UserManager;
  guild: ServerManager;
  roles: RoleManager;
  channels: ChannelManager;
  logs: LogsManager;
  levels: LevelManager;
  events: EventManager;

  constructor(private dbPath: string) { }

  private instance() {
    this.users = new UserManager(this.db)
    this.guild = new ServerManager(this.db, this)
    this.roles = new RoleManager(this.db, this)
    this.channels = new ChannelManager(this.db)
    this.logs = new LogsManager(this.db)
    this.levels = new LevelManager(this.db)
    this.events = new EventManager(this.db)
  }

  /**
     * Conecta a la base de datos.
     * @returns {Promise<void>}
     */
  public async connect(): Promise<void> {
    try {
      const dbPath = `${this.dbPath}/vscbot.db`
      console.log(`[vscbot] Initializing database at: ${dbPath}`);
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      this.instance()
      await this.createTables()
      console.log('Conectado a la base de datos SQLite.');
    } catch (err) {
      console.error(`error al conectar a la base de datos: ${err}`)
      process.exit(1);
    }
  }

  private async createTables() {
    const sqls = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        username VARCHAR NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT NOT NULL UNIQUE,
        name VARCHAR NOT NULL,
        owner_id INTEGER,
        creation_date TEXT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      );`,
      `CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL UNIQUE,
        server_id INTEGER NOT NULL,
        name VARCHAR NOT NULL,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id TEXT NOT NULL UNIQUE,
        server_id INTEGER NOT NULL,
        name VARCHAR NOT NULL,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS customRoles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        server_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      );`,
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
      );`,
      `CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        server_id INTEGER,
        xp INTEGER,
        level INTEGER,
        last_message TEXT NOT NULL,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS reward_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER,
        level INTEGER,
        server_id INTEGER,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS server_settings (
        server_id INTEGER PRIMARY KEY,
        prefix TEXT NOT NULL DEFAULT '!',
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_levels_user_server ON levels(user_id, server_id);`,
      `CREATE TABLE IF NOT EXISTS server_event_config (
        server_id TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 0,
        default_role_id TEXT DEFAULT '',
        events_channel TEXT DEFAULT '',
        logs_channel TEXT DEFAULT '',
        voice_category TEXT DEFAULT '',
        text_category TEXT DEFAULT '',
        archive_category TEXT DEFAULT '',
        use_discord_events INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );`,
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        role_id TEXT,
        channel_id TEXT,
        custom_message TEXT,
        use_discord_event INTEGER DEFAULT 0,
        start_time TEXT NOT NULL,
        end_time TEXT,
        recurrence TEXT DEFAULT 'none',
        activities TEXT DEFAULT '[]',
        channel_behavior TEXT DEFAULT 'delete',
        retention_hours INTEGER DEFAULT 0,
        status TEXT DEFAULT 'scheduled',
        created_by TEXT,
        voice_channel_id TEXT,
        text_channel_id TEXT,
        message_id TEXT,
        discord_event_id TEXT,
        reminder_sent INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );`,
      `CREATE TABLE IF NOT EXISTS event_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TEXT NOT NULL,
        left_at TEXT,
        duration_sec INTEGER,
        source TEXT DEFAULT 'voice'
      );`,
      `CREATE TABLE IF NOT EXISTS event_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        success_count INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT 0
      );`
    ]
    for (const sql of sqls) {
      await this.db.run(sql)
    }
    const migrations = [
      `ALTER TABLE events ADD COLUMN channel_behavior TEXT DEFAULT 'delete'`,
      `ALTER TABLE events ADD COLUMN retention_hours INTEGER DEFAULT 0`,
      `ALTER TABLE events ADD COLUMN text_channel_name TEXT DEFAULT NULL`,
      `ALTER TABLE events ADD COLUMN channel_topic TEXT DEFAULT NULL`,
      `ALTER TABLE events ADD COLUMN voice_channel_name TEXT DEFAULT NULL`,
      `ALTER TABLE events ADD COLUMN require_confirmation INTEGER DEFAULT NULL`,
      `ALTER TABLE server_event_config ADD COLUMN require_confirmation INTEGER DEFAULT 1`,
      `ALTER TABLE events ADD COLUMN image_url TEXT DEFAULT NULL`,
      `ALTER TABLE events ADD COLUMN send_events_channel_msg INTEGER DEFAULT 1`,
      `ALTER TABLE events ADD COLUMN events_channel_message_id TEXT DEFAULT NULL`,
      `ALTER TABLE events ADD COLUMN is_private INTEGER DEFAULT 0`,
    ]
    for (const sql of migrations) {
      try { await this.db.run(sql) } catch { }
    }
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
