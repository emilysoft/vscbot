import { DB_User, DB_Server, DB_UserLevel, RankData } from "../../db/Idatabase.js";
import Client from "../../interfaces/ICustomClient.js"
import { Message, User, Guild } from "discord.js"

export default class LevelSystem {

    // Factor de Constante (C) ajustado para 800k XP al Nivel 100
    private static readonly C_FACTOR: number = 0.1118;
    private static readonly COOLDOWN_MS: number = 30000;

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
    public static async processMessage(message:Message, client: Client): Promise<boolean> {
        const {guild, author} = message;

        if(!guild) throw new Error("error guild no conseguido")

        const userDB = await client.db.users.get(author) as DB_User;
        const owner = await guild.fetchOwner()
        const serverDB = await client.db.guild.get(guild, owner.user) as DB_Server;

        if (!userDB || !serverDB || !userDB.id || !serverDB.id) {
            // Manejo de error: Deberías asegurar su creación antes de llamar a esta función,
            // como haces en tu código de ejemplo (client.db.users.create, client.db.guild.create).
            console.error("Usuario o Servidor DB no encontrado/creado.");
            return false;
        }

        const userId = userDB.id;
        const serverId = serverDB.id;

        // 2. Obtener o Crear registro de Nivel
        let userLevelDB = await client.db.levels.get(author, guild) as DB_UserLevel;
        if (!userLevelDB) {
            //userLevelDB = await client.db.userLevels.create({
            //    user_id: userId,
            //    server_id: serverId,
            //    total_xp: 0,
            //    level: 1,
            //    last_message: new Date().toISOString()
            //});
            // Nuevo usuario siempre devuelve false en la primera ejecución
            return false;
        }

        // 3. Verificar Cooldown
        const lastMsgTime = new Date(userLevelDB.last_message).getTime();
        const now = Date.now();
        if (now - lastMsgTime < LevelSystem.COOLDOWN_MS) {
            return false; // Cooldown activo, no gana XP
        }

        // 4. Calcular XP Ganada (Ej: Random entre 15 y 25)
        const xpGained = Math.floor(Math.random() * 10) + 15;

        // 5. Determinar el Nivel ANTES de la subida
        const previousLevel = userLevelDB.level;

        // 6. Actualizar XP y Nivel
        userLevelDB.total_xp += xpGained;
        userLevelDB.level = LevelSystem.calculateLevel(userLevelDB.total_xp);
        userLevelDB.last_message = new Date().toISOString();

        // 7. Guardar en DB
        //await client.db.levels.update(userLevelDB);

        // 8. Devolver si subió de nivel
        return userLevelDB.level > previousLevel;
    }

    // --- LÓGICA DE RANK/TARJETA ---

    /**
     * Prepara los datos para mostrar el rango del usuario.
     */
    public static async getRankData(client: Client, user:User, guild:Guild): Promise<RankData | null> {
        const userDB = await client.db.users.get(user) as DB_User;
        const owner = await guild.fetchOwner()
        const serverDB = await client.db.guild.get(guild, owner.user) as DB_Server;

        if (!userDB || !serverDB || !userDB.id || !serverDB.id) return null;

        const userLevelDB = await client.db.levels.get(user, guild) as DB_UserLevel;
        if (!userLevelDB) return null;

        const currentLevel = userLevelDB.level;
        const totalXp = userLevelDB.total_xp;

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
            // Nota: Para obtener el 'rank', necesitarías una consulta SQL más compleja
            // a userLevels ordenando por total_xp, lo que va más allá de esta clase.
        };
    }
}
