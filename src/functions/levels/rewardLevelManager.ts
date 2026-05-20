// gestor de premios (los roles de niveles)
import { DB_RewardRoles, DB_Server, DB_UserLevel} from '../../db/Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import { User, Role, Guild} from "discord.js"

export default class RewardLevelManager {
  private db!: SQLiteDatabase
  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  public async get(level:number, server: DB_Server): Promise<DB_RewardRoles |  undefined> {
    if (level && server?.id) {
      return await this.db.get<DB_RewardRoles>(`
        SELECT * FROM reward_roles WHERE level = ? AND server_id = ?`, level, server.id)
    }
    return undefined
  }

  public async getAll(server_id: number): Promise<DB_RewardRoles[] | undefined> {
    return await this.db.all<DB_RewardRoles[]>(
      `SELECT * FROM reward_roles WHERE server_id = ?`,
      server_id
    )
  }

  public async create(rewardRole:DB_RewardRoles): Promise<void> {
      const result = await this.db.get(
        `INSERT INTO reward_roles (role_id, level, server_id) VALUES (?, ?, ?)`,
        rewardRole.role_id,
        rewardRole.level,
        rewardRole.server_id
      );
  }

  public async update(rewardRole: DB_RewardRoles): Promise<void> {
    await this.db.get(`UPDATE reward_roles SET role_id = ? WHERE server_id = ? AND level = ?`,
      rewardRole.role_id,
      rewardRole.server_id,
      rewardRole.level
    )
  }
}
