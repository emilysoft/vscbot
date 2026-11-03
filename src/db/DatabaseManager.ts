import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import UserManager from "./userManager.js";
import ServerManager from "./guildManager.js";
import RoleManager from "./RoleManager.js";
import ChannelManager from "./channelManager.js";
import LogsManager from "./logManager.js";
import { DB_ServerSettings } from "./Idatabase.js";
import LevelManager from "../functions/levels/levelManager.js";
import EventManager from "./EventManager.js";
import ReminderManager from "./ReminderManager.js";
import RssManager from "./RssManager.js";
import NewMemberRestrictionManager from "./NewMemberRestrictionManager.js";
import MudaeResetManager from "./MudaeResetManager.js";
import AutomodManager from "./automodManager.js";
import type { AppDatabase } from "./client.js";
import * as schema from "./schema.js";

const MIGRATIONS_FOLDER = fileURLToPath(
  new URL("../../drizzle", import.meta.url),
);

export default class DatabaseManager {
  private sqlite!: Database.Database;
  public db!: AppDatabase;

  users: UserManager;
  guild: ServerManager;
  roles: RoleManager;
  channels: ChannelManager;
  logs: LogsManager;
  levels: LevelManager;
  events: EventManager;
  reminders: ReminderManager;
  rss: RssManager;
  newMemberRestrictions: NewMemberRestrictionManager;
  mudae: MudaeResetManager;
  automod: AutomodManager;

  constructor(private dbPath: string) {}

  private instance() {
    this.users = new UserManager(this.db);
    this.guild = new ServerManager(this.db, this);
    this.roles = new RoleManager(this.db, this);
    this.channels = new ChannelManager(this.db);
    this.logs = new LogsManager(this.db);
    this.levels = new LevelManager(this.db);
    this.events = new EventManager(this.db);
    this.reminders = new ReminderManager(this.db);
    this.rss = new RssManager(this.db);
    this.newMemberRestrictions = new NewMemberRestrictionManager(this.db);
    this.mudae = new MudaeResetManager(this.db);
    this.automod = new AutomodManager(this.db);
  }

  /**
   * Conecta a la base de datos y aplica las migraciones pendientes.
   * @returns {Promise<void>}
   */
  public async connect(): Promise<void> {
    try {
      const dbPath = `${this.dbPath}/vscbot.db`;
      console.log(`[vscbot] Initializing database at: ${dbPath}`);
      mkdirSync(this.dbPath, { recursive: true });

      this.sqlite = new Database(dbPath);
      // WAL: lecturas concurrentes con un único escritor.
      this.sqlite.pragma("journal_mode = WAL");
      // FULL: cada commit se sincroniza a disco, así un corte de luz no puede
      // perder las últimas transacciones. El bot escribe poco, el costo es bajo.
      this.sqlite.pragma("synchronous = FULL");
      // SQLite no valida las FK por defecto: se activa por conexión.
      this.sqlite.pragma("foreign_keys = ON");
      this.sqlite.pragma("busy_timeout = 5000");

      this.db = drizzle(this.sqlite, { schema });
      migrate(this.db, { migrationsFolder: MIGRATIONS_FOLDER });

      this.instance();
      console.log("Conectado a la base de datos SQLite.");
    } catch (err) {
      console.error(`error al conectar a la base de datos: ${err}`);
      process.exit(1);
    }
  }

  /**
   * Obtiene la configuración de un servidor por su ID interno.
   * @param {number} serverId - ID interno del servidor.
   * @returns {Promise<DB_ServerSettings | undefined>}
   */
  public async getServerSettings(
    serverId: number,
  ): Promise<DB_ServerSettings | undefined> {
    return this.db
      .select()
      .from(schema.serverSettings)
      .where(eq(schema.serverSettings.server_id, serverId))
      .get();
  }

  /**
   * Actualiza o inserta la configuración de un servidor.
   * @param {DB_ServerSettings} settings - Datos de configuración.
   * @returns {Promise<void>}
   */
  public async upsertServerSettings(
    settings: DB_ServerSettings,
  ): Promise<void> {
    this.db
      .insert(schema.serverSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: schema.serverSettings.server_id,
        set: { prefix: settings.prefix },
      })
      .run();
  }

  public async close(): Promise<void> {
    this.sqlite.close();
    console.log("Conexión a la base de datos cerrada.");
  }
}
