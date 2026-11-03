import { Message } from "discord.js"
import Client from "./../../../interfaces/ICustomClient.js"
import Iautomod from "./../../../interfaces/Iautomod.js"
import config from "./../../../config/index.js"
const regex =
  /(puedo|deja)\s+(pasar|enviar|mandar)\s+(unas\s+|una\s+)?(imagenes|capturas?|imagen|foto|fotos|videos|m(e|o)m(o|e)s)/gim;
export default {
  name: "attachmentPermissionAdviser",
  scope: "global",
  ignoreBots: true,
  allowEdited: true,
  execute: async function (message: Message, client: Client) {
    try {
      if (!message.member) return
      if (!message.guild) return
      if (message.guild.id == config.guilds.main) {
        if (message.member.roles.cache.has(config.roles.levelTen)) return;
        if (message.member.roles.cache.has(config.roles.levelFive)) return;
      }

      if (message.content.match(regex) != null) {
        message.reply(
          "https://tenor.com/view/embed-fail-embed-discord-memes-no-image-perms-image-perms-flex-gif-24899732"
        );
      }
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  }
} as Iautomod
