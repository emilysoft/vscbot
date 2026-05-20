import { DB_UserLevel, DB_AllLogs } from '../../db/Idatabase.js'
import { Database as SQLiteDatabase } from 'sqlite';
import { User, Guild} from "discord.js"
import RewardLevelManager from "./rewardLevelManager.js"



export default class LevelManager {
  private db!: SQLiteDatabase
  public rewardLevels: RewardLevelManager;
  constructor(db: SQLiteDatabase) {
    this.db = db;
    this.rewardLevels = new RewardLevelManager(this.db)
  }

  public async get(user?:User, guild?: Guild): Promise<DB_UserLevel | Promise<DB_UserLevel[]> | undefined> {
    if (user?.id && guild?.id) {
      return await this.db.get<DB_UserLevel | undefined>(`
        SELECT
        u.id AS user_id,
        s.id AS server_id,
        l.id,
        l.xp AS xp,
        l.level,
        l.last_message
        FROM levels AS l
        JOIN users AS u ON u.id = l.user_id
        JOIN servers AS s ON s.id = l.server_id
        WHERE u.user_id = ? AND s.server_id = ?`, user.id, guild.id)
    } else {
      return await this.db.all<DB_UserLevel[]>(`SELECT * FROM levels`)
    }
  }

  public async create(userLevel:DB_UserLevel): Promise<DB_UserLevel | undefined> {
    const result = await this.db.run(
      `INSERT INTO levels (user_id, server_id, xp, level, last_message) VALUES (?, ?, ?, ?, ?)`,
      userLevel.user_id,
      userLevel.server_id,
      userLevel.xp,
      userLevel.level,
      userLevel.last_message
    );
    return await this.db.get<DB_UserLevel>(`SELECT * FROM levels WHERE id = ?`, result.lastID)
  }

  public async update(userLevel: DB_UserLevel): Promise<void> {
    const result = await this.db.run(`UPDATE levels SET xp = ?, level = ?, last_message = ? WHERE id = ?`,
      userLevel.xp,
      userLevel.level,
      userLevel.last_message,
      userLevel.id
    )
  }

  public async getRank(userId: number, serverId: number): Promise<number | null> {
    // Consulta para obtener la posición de un usuario en un servidor
    const result = await this.db.get<{rank: number}>(`
      SELECT rank FROM (
        SELECT
          user_id,
          ROW_NUMBER() OVER(ORDER BY xp DESC) as rank
        FROM levels
        WHERE server_id = ?
      )
      WHERE user_id = ?
    `, serverId, userId);

    return result ? result.rank : null;
  }


  public async getAllLogs(timestamp:string): Promise<DB_AllLogs [] | undefined> {
    return await this.db.all<DB_AllLogs[]>(`
      SELECT
        u.id,
        u.user_id,
        l.creation_date
      FROM logs AS l
      JOIN users AS u ON u.id = l.user_id
      WHERE creation_date >= ?
      ORDER BY creation_date ASC;
    `, timestamp)
  }
}
