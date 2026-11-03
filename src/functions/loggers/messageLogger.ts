import { Message, TextChannel } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import { DB_User, DB_Channel, DB_Server } from "../../db/Idatabase.js";
import config from "../../config/index.js";

const module = async (message: Message, type: string, client: Client) => {
  try {
    const categories = [
      config.categories.general,
      config.categories.zonaGamer,
      config.categories.nsfw,
      config.categories.tickets,
    ];

    if (message.content.match(/^\$wa/) != null) return;

    const { author, channel, guild } = message;

    // Early returns de seguridad del Código B
    if (!guild || !author || !channel) return;
    if (!(channel instanceof TextChannel)) return;

    // Filtros de canales
    if (channel.id == config.channels.mudae) return; // mudae
    if (channel.parentId == config.categories.registroPrincipales) return; // registro principales
    if (channel.parentId == config.categories.registro) return; // registro secundarios
    if (channel.id == config.channels.panel) return; // panel
    if (channel.id == config.channels.memesOld) return; // memes
    if (channel.id == config.channels.patas) return; // mudae

    let typeLog;
    if (type == "create") typeLog = ":green_circle:";
    else if (type == "delete") typeLog = ":red_circle:";
    else if (type == "edit") typeLog = ":orange_circle:";
    else {
      throw new Error(
        "Error al especificar el tipo de evento de mensaje para el messageLogger",
      );
    }

    // --- Mantenemos el formato ISO del Código A para evitar errores de fecha ---
    const nowISO = new Date().toISOString();

    const authorID = author.id;
    const channelName = channel.name;
    const userName = author.username;
    let messageContent = "";

    // Lógica de contenido de mensaje
    if (message.content == "") {
      if (message.attachments.size > 0) {
        messageContent = message.attachments.reduce(
          (acc, curr) => acc + "\n" + curr.url,
          "",
        );
      } else if (message.embeds.length > 0) {
        messageContent = "Embed";
      } else if (message.stickers.size > 0) {
        messageContent = `sticker: ${message.stickers.first()?.name || "desconocido"}`;
      }
    } else {
      messageContent = message.content;
    }

    const log1 = `[${typeLog}][${nowISO}][${authorID}][${channelName}] ${userName}: ${messageContent}`;
    console.log(log1);

    // Lógica de envío de logs a Discord
    if (guild.id === config.guilds.main) {
      if (categories.includes(channel.parentId as string)) {
        const logMsg = `${typeLog} __[#${channelName.replace(/[^a-zA-Z0-9-]+/, "")}](<https://discord.com/channels/${guild.id}/${channel.id}/${message.id}>)__ **${userName}**: ${messageContent} ||userID:[${authorID}]||`;
        const logChannel = guild.channels.cache.get(config.channels.imageLog);
        if (logChannel instanceof TextChannel) {
          await logChannel.send(
            logMsg
              .replace(/<@/gim, "<!@")
              .replace(/@everyone/gim, "@!everyone")
              .replace(/@here/gim, "@!here".substring(0, 1990)),
          );
        }
      }
    }

    if (type != "create") return;

    // --- Lógica de Base de Datos (Estructura del Código B, Fechas del Código A) ---
    let owner = guild.members.cache.get(guild.ownerId);
    if (!owner) {
      owner = await guild.fetchOwner();
    }
    let serverDB = (await client.db.guild.get(guild)) as DB_Server | undefined;
    if (!serverDB) {
      serverDB = await client.db.guild.create(guild, owner.user);
    }
    if (!serverDB?.id) throw new Error("error al buscar id de server_db");

    const user_db = (await client.db.users.get(author)) as DB_User;
    const channel_db = (await client.db.channels.get(
      channel,
      serverDB.id,
    )) as DB_Channel;

    if (!user_db || !serverDB || !user_db.id) {
      console.error("Usuario o Servidor DB no encontrado/creado.");
      return false;
    }

    // Registro final en la tabla de logs
    await client.db.logs.create({
      server_id: serverDB.id,
      channel_id: channel_db.id,
      user_id: user_db.id,
      interaction: messageContent,
      logType: "MESSAGE CREATED",
      creation_date: nowISO, // Usamos el ISOString aquí
    });
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
};

export default module;
