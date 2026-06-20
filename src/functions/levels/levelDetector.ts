import { Message, TextChannel } from "discord.js";
import LevelSystem from "../../functions/levels/levelSystem.js";
import { DB_UserLevel } from '../../db/Idatabase.js';
import Client from "../../interfaces/ICustomClient.js";

export default async function levelDetector(message: Message, client: Client) {
  try {
    // Filtros básicos rápidos para evitar procesamiento innecesario
    if (message.author.bot || !message.guild || !(message.channel instanceof TextChannel)) return;

    const { member, guild, author } = message;
    if (!member) return;

    // Procesamos el mensaje y verificamos si subió de nivel
    const didLevelUp = await LevelSystem.processMessage(member, client);

    // --- OPTIMIZACIÓN DIVA: Solo ejecutamos lógica pesada si realmente subió de nivel ---
    if (!didLevelUp) return;

    const userLevelDB = await client.db.levels.get(author, guild) as DB_UserLevel;
    if (!userLevelDB) return;

    const currentLevel = userLevelDB.level;
    const REWARD_LEVELS = new Set([1, 5, 10, 20, 30, 40, 50, 60, 67, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160]);

    // Si el nivel actual es un hito de recompensa, actuamos
    if (REWARD_LEVELS.has(currentLevel)) {
      await message.channel.send(`✨ **${author}** ¡Qué elegancia! Has alcanzado el **nivel ${currentLevel}** ✨`);

      // Pasamos el control a la función de roles de forma ordenada
      await LevelSystem.syncRewardRoles(member!, currentLevel, client);
    }

  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
    console.error("Error en levelDetector:", err);
  }
}
