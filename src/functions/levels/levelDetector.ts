import { Message, TextChannel } from "discord.js";
import LevelSystem from "../../functions/levels/levelSystem.js";
import { DB_Server, DB_Role, DB_RewardRoles, DB_UserLevel } from '../../db/Idatabase.js';
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
      await giveRewardRole(currentLevel, message, client);
    }

  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
    console.error("Error en levelDetector:", err);
  }
}

async function giveRewardRole(level: number, message: Message, client: Client) {
  const { guild, member } = message;
  if (!guild || !member) return;

  let serverDB = await client.db.guild.get(guild) as DB_Server | undefined
  if(!serverDB) {
    let owner = guild.members.cache.get(guild.ownerId)
    if(!owner) {
      owner = await guild.fetchOwner()
    }
    serverDB = await client.db.guild.create(guild, owner.user)
    if(!serverDB) throw new Error("error al crear un servidor en la db")

  }

  const rewardRoleDB = await client.db.levels.rewardLevels.get(level, serverDB) as DB_RewardRoles | undefined;

  if (!rewardRoleDB?.role_id) {
    return console.log(`[Info] No hay un rol configurado para el nivel ${level}.`);
  }

  const roleDB = await client.db.roles.get({ id: rewardRoleDB.role_id }) as DB_Role;
  if (!roleDB?.role_id) return;

  // Verificamos si ya tiene el rol para asegurar la idempotencia
  if (!member.roles.cache.has(roleDB.role_id)) {
    try {
      const role = await guild.roles.fetch(roleDB.role_id);
      if (role) {
        await member.roles.add(role);
      }
    } catch (fetchErr) {
      console.error(`No se pudo asignar el rol ${roleDB.role_id}:`, fetchErr);
    }
  }
}
