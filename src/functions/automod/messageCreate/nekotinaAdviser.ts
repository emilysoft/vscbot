import { Message } from "discord.js";
import errorLogger from "../../loggers/errorLogger.js"
import Client from "../../../classes/ICustomClient.js"
const regex = /^(neko|!)/;

const module = async (message: Message, client:Client) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id == "1112164583344443433") {
            if (message.content.match(regex) != null) {
                message.reply("Usa <#1277384727615242342> para usar nekotina.");
            }
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module
