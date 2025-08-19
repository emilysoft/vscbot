import { Message } from "discord.js"
import Client from "./../../../interfaces/ICustomClient.js"
import Iautomod from "./../../../interfaces/Iautomod.js"
const regex =
    /(puedo|deja)\s+(pasar|enviar|mandar)\s+(unas\s+|una\s+)?(imagenes|capturas?|imagen|foto|fotos|videos|m(e|o)m(o|e)s)/gim;
export default {
    name: "attachmentPermissionAdviser",
    exclusive: false,
    ignoreBots: true,
    allowEdited: true,
    execute: async function (message: Message, client: Client) {
        try {
            if (!message.member) return
            if (!message.guild) return
            if (message.guild.id == "813538324320092161") {
                if (message.member.roles.cache.has("813546760152547348")) return;
                if (message.member.roles.cache.has("813545491957940244")) return;
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
