import { DB_Role, DB_CustomRole, DB_User, DB_Server} from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import { Guild, Role, User } from 'discord.js'
import { IroleData } from '../db/Idatabase.js';
import DatabaseManager from "./DatabaseManager.js"

export default class RoleManager {
  private db!: SQLiteDatabase
  update: UpdateRole
  custom: CustomRole
  databaseManager: DatabaseManager

  constructor(db: SQLiteDatabase, databaseManager: DatabaseManager) {
    this.db = db;
    this.update = new UpdateRole(this.db)
    this.custom = new CustomRole(db, this, databaseManager)
    this.databaseManager = databaseManager
  }

  public async get(roleData: IroleData): Promise<DB_Role | undefined> {
    if (roleData?.id) {
      return await this.db.get<DB_Role>(
        `SELECT * FROM roles WHERE id = ?`,
        roleData.id
      );
    }

    if (roleData.role?.id && roleData.server?.id) {
      return await this.db.get<DB_Role>(
        `SELECT * FROM roles WHERE role_id = ? AND server_id = ?`,
        roleData.role.id,
        roleData.server.id
      );
    }

    return undefined;
  }

  public async create(role: Role, server: DB_Server): Promise<DB_Role | undefined> {
    const result = await this.db.run(
      `INSERT INTO roles (role_id, name, server_id) VALUES (?, ?, ?)`,
      role.id,
      role.name,
      server.id
    );
    return await this.db.get<DB_Role>(`SELECT * FROM roles WHERE id = ?`, result.lastID)
  }

  public async ensure(roleData: IroleData): Promise<DB_Role | undefined> {
    // 1. Intentamos obtener el rol si ya existe
    const existing = await this.get(roleData);
    if (existing) return existing;

    // 2. Validaciones previas a la creación
    if (!roleData.role?.id || !roleData.server?.id) {
      throw new Error("Datos de Discord insuficientes (role_id o server_id ausentes).");
    }

    // bloque de codigo temporal
    try {
      const newRole = await this.create(roleData.role, roleData.server);
      if (newRole) return newRole;
    } catch (error: any) {
      // 4. Manejo del SQLITE_CONSTRAINT
      if (error.code === 'SQLITE_CONSTRAINT') {
        // Si falló por restricción, significa que alguien lo creó justo después de nuestro primer 'get'
        return await this.get(roleData);
      }
      throw error; // Re-lanzamos errores que no sean de restricción
    }
  }

  public async delete(db_role_id: number): Promise<void> {
    await this.db.run(`DELETE FROM customRoles WHERE role_id = ?`, db_role_id)
  }
}

class CustomRole {
  private db!: SQLiteDatabase
  roleManager: RoleManager
  databaseManager: DatabaseManager
  constructor(db: SQLiteDatabase, roleManager: RoleManager, databaseManager: DatabaseManager) {
    this.db = db;
    this.roleManager = roleManager
    this.databaseManager = databaseManager
  }

  public async get(user_id: string, server_id: string): Promise<DB_Role | undefined> {
    return await this.db.get<DB_Role>(`
      SELECT
      r.id,
      r.role_id,
      r.name
      FROM customRoles AS cr
      JOIN users AS u ON u.id = cr.user_id
      JOIN roles AS r ON r.id = cr.role_id
      JOIN servers AS s ON s.id = cr.server_id
      WHERE u.user_id = ? AND s.server_id = ?`, user_id, server_id)
  }

  public async create(role: Role, user: User, guild: Guild): Promise<number | undefined> {

    const existingRole = await this.get(user.id, guild.id)
    if (existingRole) throw new Error("role personalizado ya existe")


    //creacion dueño del server
    let owner = guild.members.cache.get(guild.ownerId)
    if(!owner) {
      owner = await guild.fetchOwner()
    }
    const serverDB = await this.databaseManager.guild.get(guild) as DB_Server;
    const user_db = await this.databaseManager.users.get(user) as DB_User
    const role_db = await this.databaseManager.roles.ensure({role:role, server: serverDB}) as DB_Role

    if(!user_db || !serverDB || !serverDB.id || !user_db.id || !role_db || !role_db.id)
      throw new Error("error al crear custom role")

    const result = await this.db.run(
      `INSERT INTO customRoles (user_id, server_id, role_id) VALUES (?, ?, ?)`,
      user_db.id,
      serverDB.id,
      role_db.id
    );
    return result.lastID;

  }
}

class UpdateRole {
  private db!: SQLiteDatabase
  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  public async name(role_id: string, name: string): Promise<void> {
    if (name.length == 0 || name.length == 0) throw new Error("datos de rol vacio")

    this.db.run(`UPDATE roles SET name = ? WHERE role_id = ?`, name, role_id)
  }
}
