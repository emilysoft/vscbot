import { and, eq, inArray } from "drizzle-orm";
import { DB_Role, DB_User, DB_Server } from "./Idatabase.js";
import { Guild, Role, User } from "discord.js";
import { IroleData } from "../db/Idatabase.js";
import DatabaseManager from "./DatabaseManager.js";
import type { AppDatabase } from "./client.js";
import { customRoles, roles, servers, users } from "./schema.js";

export default class RoleManager {
  private db: AppDatabase;
  update: UpdateRole;
  custom: CustomRole;
  databaseManager: DatabaseManager;

  constructor(db: AppDatabase, databaseManager: DatabaseManager) {
    this.db = db;
    this.update = new UpdateRole(this.db);
    this.custom = new CustomRole(db, this, databaseManager);
    this.databaseManager = databaseManager;
  }

  public async get(roleData: IroleData): Promise<DB_Role | undefined> {
    if (roleData?.id) {
      return this.db
        .select()
        .from(roles)
        .where(eq(roles.id, roleData.id))
        .get();
    }

    if (roleData.role?.id && roleData.server?.id) {
      return this.db
        .select()
        .from(roles)
        .where(
          and(
            eq(roles.role_id, roleData.role.id),
            eq(roles.server_id, roleData.server.id),
          ),
        )
        .get();
    }

    return undefined;
  }

  public async create(
    role: Role,
    server: DB_Server,
  ): Promise<DB_Role | undefined> {
    if (server.id === undefined) return undefined;
    return this.db
      .insert(roles)
      .values({ role_id: role.id, name: role.name, server_id: server.id })
      .returning()
      .get();
  }

  public async ensure(roleData: IroleData): Promise<DB_Role | undefined> {
    // 1. Intentamos obtener el rol si ya existe
    const existing = await this.get(roleData);
    if (existing) return existing;

    // 2. Validaciones previas a la creación
    if (!roleData.role?.id || !roleData.server?.id) {
      throw new Error(
        "Datos de Discord insuficientes (role_id o server_id ausentes).",
      );
    }

    // bloque de codigo temporal
    try {
      const newRole = await this.create(roleData.role, roleData.server);
      if (newRole) return newRole;
    } catch (error: any) {
      // 4. Manejo del SQLITE_CONSTRAINT (better-sqlite3 usa el codigo extendido:
      //    SQLITE_CONSTRAINT_UNIQUE, SQLITE_CONSTRAINT_NOTNULL, ...)
      if (
        typeof error?.code === "string" &&
        error.code.startsWith("SQLITE_CONSTRAINT")
      ) {
        // Si falló por restricción, significa que alguien lo creó justo después de nuestro primer 'get'
        return await this.get(roleData);
      }
      throw error; // Re-lanzamos errores que no sean de restricción
    }
  }

  public async delete(db_role_id: number): Promise<void> {
    this.db
      .delete(customRoles)
      .where(eq(customRoles.role_id, db_role_id))
      .run();
  }
}

class CustomRole {
  private db: AppDatabase;
  roleManager: RoleManager;
  databaseManager: DatabaseManager;
  constructor(
    db: AppDatabase,
    roleManager: RoleManager,
    databaseManager: DatabaseManager,
  ) {
    this.db = db;
    this.roleManager = roleManager;
    this.databaseManager = databaseManager;
  }

  public async get(
    user_id: string,
    server_id: string,
  ): Promise<DB_Role | undefined> {
    return this.db
      .select({
        id: roles.id,
        role_id: roles.role_id,
        name: roles.name,
        server_id: roles.server_id,
      })
      .from(customRoles)
      .innerJoin(users, eq(users.id, customRoles.user_id))
      .innerJoin(roles, eq(roles.id, customRoles.role_id))
      .innerJoin(servers, eq(servers.id, customRoles.server_id))
      .where(and(eq(users.user_id, user_id), eq(servers.server_id, server_id)))
      .get();
  }

  public async create(
    role: Role,
    user: User,
    guild: Guild,
  ): Promise<number | undefined> {
    const existingRole = await this.get(user.id, guild.id);
    if (existingRole) throw new Error("role personalizado ya existe");

    //creacion dueño del server
    let owner = guild.members.cache.get(guild.ownerId);
    if (!owner) {
      owner = await guild.fetchOwner();
    }
    const serverDB = (await this.databaseManager.guild.get(guild)) as DB_Server;
    const user_db = (await this.databaseManager.users.get(user)) as DB_User;
    const role_db = (await this.databaseManager.roles.ensure({
      role: role,
      server: serverDB,
    })) as DB_Role;

    if (
      !user_db ||
      !serverDB ||
      !serverDB.id ||
      !user_db.id ||
      !role_db ||
      !role_db.id
    )
      throw new Error("error al crear custom role");

    const inserted = this.db
      .insert(customRoles)
      .values({
        user_id: user_db.id,
        server_id: serverDB.id,
        role_id: role_db.id,
      })
      .returning({ id: customRoles.id })
      .get();
    return inserted?.id;
  }

  public async getAll(): Promise<
    Array<{
      user_id_str: string;
      server_id_str: string;
      role_id_str: string;
      left_since?: string | null;
    }>
  > {
    return this.db
      .select({
        user_id_str: users.user_id,
        server_id_str: servers.server_id,
        role_id_str: roles.role_id,
        left_since: customRoles.left_since,
      })
      .from(customRoles)
      .innerJoin(users, eq(users.id, customRoles.user_id))
      .innerJoin(servers, eq(servers.id, customRoles.server_id))
      .innerJoin(roles, eq(roles.id, customRoles.role_id))
      .all();
  }

  public async setLeftSince(
    roleIdStr: string,
    iso: string | null,
  ): Promise<void> {
    this.db
      .update(customRoles)
      .set({ left_since: iso })
      .where(
        inArray(
          customRoles.role_id,
          this.db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.role_id, roleIdStr)),
        ),
      )
      .run();
  }

  public async deleteByRoleIdStr(roleIdStr: string): Promise<void> {
    this.db
      .delete(customRoles)
      .where(
        inArray(
          customRoles.role_id,
          this.db
            .select({ id: roles.id })
            .from(roles)
            .where(eq(roles.role_id, roleIdStr)),
        ),
      )
      .run();
  }
}

class UpdateRole {
  private db: AppDatabase;
  constructor(db: AppDatabase) {
    this.db = db;
  }

  public async name(role_id: string, name: string): Promise<void> {
    if (name.length == 0 || name.length == 0)
      throw new Error("datos de rol vacio");

    this.db.update(roles).set({ name }).where(eq(roles.role_id, role_id)).run();
  }
}
