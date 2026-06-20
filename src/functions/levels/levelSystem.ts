import { DB_User, DB_Server, DB_UserLevel, DB_RewardRoles, DB_Role, RankData } from "../../db/Idatabase.js";
import Client from "../../interfaces/ICustomClient.js"
import { GuildMember, User, Guild } from "discord.js"

export default class LevelSystem {

  // Factor de Constante (C) ajustado para 800k XP al Nivel 100
  private static readonly C_FACTOR: number = 0.1118;
  private static readonly COOLDOWN_MS: number = 10 * 1000;

  // --- CÁLCULOS ESTÁTICOS ---

  /**
     * Calcula el nivel a partir de la XP total.
     * Fórmula: Nivel = floor( C * sqrt(XP_total) )
     */
  public static calculateLevel(totalXp: number): number {
    if (totalXp <= 0) return 1;
    const level = Math.floor(LevelSystem.C_FACTOR * Math.sqrt(totalXp));
    return Math.max(1, level); // Asegura que el nivel mínimo sea 1
  }

  /**
     * Calcula la XP MÍNIMA total requerida para un nivel objetivo.
     * Fórmula Inversa: XP = (Nivel / C)^2
     */
  public static calculateXpNeeded(targetLevel: number): number {
    if (targetLevel <= 1) return 0;
    const requiredXp = Math.pow((targetLevel / LevelSystem.C_FACTOR), 2);
    return Math.floor(requiredXp);
  }

  // --- LÓGICA PRINCIPAL DE XP ---

  /**
     * Procesa la ganancia de XP de un mensaje.
     * @returns `true` si el usuario subió de nivel, `false` en caso contrario.
     */
  public static async processMessage(member:GuildMember, client: Client, messageTimestamp: number = Date.now() ): Promise<boolean> {
    const {guild, user} = member;

    if(!guild) throw new Error("error guild no conseguido")

    const userDB = await client.db.users.get(user) as DB_User;
    let owner = member.guild.members.cache.get(guild.ownerId)
    if(!owner) {
      owner = await guild.fetchOwner()
    }
    let serverDB = await client.db.guild.get(guild) as DB_Server | undefined;
    if(!serverDB) {
      serverDB = await client.db.guild.create(guild, owner.user)
    }

    if(!userDB) throw new Error("usuario no encontrado en la base de datos")
    if(!serverDB) throw new Error("server no encontrado en la base de datos")
    if (!userDB || !serverDB || !userDB.id || !serverDB.id) {
      console.error("Usuario o Servidor DB no encontrado/creado.");
      return false;
    }

    const userId = userDB.id;
    const serverId = serverDB.id;

    // 2. Obtener o Crear registro de Nivel
    let userLevelDB = await client.db.levels.get(user, guild) as DB_UserLevel | undefined;

    if (!userLevelDB) {
      userLevelDB = await client.db.levels.create({
        user_id: userId,
        server_id: serverId,
        xp: 0,
        level: 1,
        last_message: new Date(messageTimestamp).toISOString()
      });
      return false;
    }

    // 3. Verificar Cooldown
    const lastMsgTime = new Date(userLevelDB.last_message).getTime();


    if (messageTimestamp - lastMsgTime < LevelSystem.COOLDOWN_MS) {
      return false;
    }

    // 4. Calcular XP Ganada (Ej: Random entre 15 y 25)
    const xpGained = Math.floor(Math.random() * 10) + 15;

    // 5. Determinar el Nivel ANTES de la subida
    const previousLevel = userLevelDB.level;

    // 6. Actualizar XP y Nivel
    userLevelDB.xp += xpGained;
    userLevelDB.level = LevelSystem.calculateLevel(userLevelDB.xp);
    userLevelDB.last_message = new Date(messageTimestamp).toISOString(); // Actualizar con fecha del log

    // 7. Guardar en DB
    await client.db.levels.update(userLevelDB);

       // 8. Devolver si subió de nivel
    return userLevelDB.level > previousLevel;
  }

  // --- LÓGICA DE RANK/TARJETA ---

  /**
     * Prepara los datos para mostrar el rango del usuario.
     */
  public static async getRankData(user:User, guild:Guild, client: Client): Promise<RankData | null> {
    const userDB = await client.db.users.get(user) as DB_User;
    let owner = guild.members.cache.get(guild.ownerId)
    if(!owner) {
      owner = await guild.fetchOwner()
    }
    let serverDB = await client.db.guild.get(guild) as DB_Server | undefined;
    if(!serverDB) {
      serverDB = await client.db.guild.create(guild, owner.user)
    }

    if (!userDB || !serverDB || !userDB.id || !serverDB.id) return null;

    const userLevelDB = await client.db.levels.get(user, guild) as DB_UserLevel;
    if (!userLevelDB) return null;

    const currentLevel = userLevelDB.level;
    const totalXp = userLevelDB.xp;

    // Calculamos la XP total que necesita el siguiente nivel
    const xpRequiredForNextLevel = LevelSystem.calculateXpNeeded(currentLevel + 1);

    // Calculamos la XP total necesaria para el nivel actual
    const xpRequiredForCurrentLevel = LevelSystem.calculateXpNeeded(currentLevel);

    // XP que lleva en el nivel actual (el "progreso")
    const xpProgress = totalXp - xpRequiredForCurrentLevel;

    // XP que falta para el siguiente nivel
    const xpToNextLevel = xpRequiredForNextLevel - totalXp;

    return {
      username: userDB.username,
      level: currentLevel,
      totalXp: totalXp,
      xpToNextLevel: xpToNextLevel,
      xpProgress: xpProgress,
    };
  }

  /**
     * Sincroniza los reward roles según el nivel actual.
     * Niveles 1 y 5 son permanentes y nunca se remueven.
     * Para el resto, solo conserva el reward role más alto alcanzado.
     */
  public static async syncRewardRoles(member: GuildMember, currentLevel: number, client: Client): Promise<void> {
    const { guild } = member;
    if (!guild) return;

    let serverDB = await client.db.guild.get(guild) as DB_Server | undefined;
    if (!serverDB) {
      const owner = await guild.fetchOwner();
      serverDB = await client.db.guild.create(guild, owner.user);
      if (!serverDB) return;
    }

    const allRewards = await client.db.levels.rewardLevels.getAll(serverDB.id as number) as DB_RewardRoles[] | undefined;
    if (!allRewards?.length) return;

    const entries: { level: number; discordId: string }[] = [];
    for (const reward of allRewards) {
      const roleDB = await client.db.roles.get({ id: reward.role_id }) as DB_Role | undefined;
      if (roleDB?.role_id) {
        entries.push({ level: reward.level, discordId: roleDB.role_id });
      }
    }

    const PERMANENT = new Set([1, 5]);
    const nonPermanent = entries.filter(e => !PERMANENT.has(e.level));
    const targetNonPerm = nonPermanent
      .filter(e => e.level <= currentLevel)
      .sort((a, b) => b.level - a.level)[0] || null;

    for (const entry of entries) {
      const hasRole = member.roles.cache.has(entry.discordId);

      if (PERMANENT.has(entry.level)) {
        if (currentLevel >= entry.level && !hasRole) {
          try { await member.roles.add(entry.discordId); } catch { }
        }
        continue;
      }

      if (entry.level === targetNonPerm?.level) {
        if (!hasRole) {
          try { await member.roles.add(entry.discordId); } catch { }
        }
      } else if (hasRole) {
        try { await member.roles.remove(entry.discordId); } catch { }
      }
    }
  }
}
