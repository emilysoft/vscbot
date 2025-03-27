import {Message} from "discord.js"
import errorLogger from "../loggers/errorLogger.js"
import Client from "./../../classes/ICustomClient.js"
const regex =
    /(puedo|deja)\s+(pasar|enviar|mandar)\s+(unas\s+|una\s+)?(imagenes|capturas?|imagen|foto|fotos|videos|m(e|o)m(o|e)s)/gim;
const module = async (message: Message, client:Client) => {
    try {
        if (message.author.bot) return;
        if (!message.member) return
        if (message.member.roles.cache.has("813546760152547348")) return;
        if (message.member.roles.cache.has("813545491957940244")) return;
        if (message.content.match(regex) != null) {
            message.reply(
                "https://tenor.com/view/embed-fail-embed-discord-memes-no-image-perms-image-perms-flex-gif-24899732"
            );
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module
