import { DB_Role, DB_CustomRole, DB_User, DB_Server, SearchData } from './Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import { Guild, Role, User } from 'discord.js'
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

    public async get(data: SearchData): Promise<DB_Role | DB_Role[] | undefined> {
        if (data.item_id) {
            return await this.db.get<DB_Role>(`SELECT * FROM roles WHERE role_id = ?`, data.item_id)
        } else if (data.id) {
            return await this.db.get<DB_Role>(`SELECT * FROM roles WHERE id = ?`, data.id)
        } else {
            return await this.db.all<DB_Role[]>(`SELECT * FROM roles`)
        }
    }

    public async create(role: DB_Role): Promise<DB_Role | undefined> {
        const result = await this.db.run(
            `INSERT INTO roles (role_id, server_id, name) VALUES (?, ?, ?)`,
            role.role_id,
            role.server_id,
            role.name
        );

        return await this.db.get<DB_Role>(
            `SELECT * FROM roles WHERE id = ?`, result.lastID
        )
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
            JOIN roles AS r ON r.id = cr.id
            JOIN servers AS s ON s.id = cr.server_id
        		WHERE u.user_id = ? AND s.server_id = ?`, user_id, server_id)
    }

    public async create(role: Role, user: User, guild: Guild): Promise<number | undefined> {
        let
            user_db,
            owner_db,
            server_db,
            role_db;

        const existingRole = await this.get(user.id, guild.id)
        if (existingRole) throw new Error("role personalizado ya existe")


        //creacion dueño del server
        owner_db = await this.databaseManager.users.get(guild.ownerId) as DB_User
        if (!owner_db) {
            const owner = await guild.fetchOwner();
            if (!owner) return
            owner_db = await this.databaseManager.users.create({
                user_id: guild.ownerId,
                username: owner.user.username
            })
        }
        if (!owner_db?.id) throw new Error("error al intentar crear un dueño en la db")

        //creacion dueño del rol 
        user_db = await this.databaseManager.users.get(user.id) as DB_User
        if (!user_db) {
            user_db = await this.databaseManager.users.create({
                user_id: user.id,
                username: user.username
            })
        }
        if (!user_db) throw new Error("error en este peo")

        // creacion del server
        server_db = await this.databaseManager.guild.get(guild.id) as DB_Server
        if (!server_db) {
            server_db = await this.databaseManager.guild.create({
                server_id: guild.id,
                name: guild.name,
                owner_id: owner_db.id,
                creation_date: guild.createdAt.toString()
            })
        }
        if (!server_db?.id) throw new Error("error al intentar crear un servidor en la db")

        // creacion del rol
        role_db = await this.databaseManager.roles.get({ item_id: role.id }) as DB_Role
        if (!role_db) {
            role_db = await this.databaseManager.roles.create({
                name: role.name,
                role_id: role.id,
                server_id: server_db.id
            })
        }
        if (!role_db?.id) throw new Error("error al intentar crear un rol en la db")

        const result = await this.db.run(
            `INSERT INTO customRoles (user_id, server_id, role_id) VALUES (?, ?, ?)`,
            user_db.id,
            server_db.id,
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
