import { Message } from "discord.js";
import errorLogger from "./loggers/errorLogger.js"
import Client from "../classes/ICustomClient.js"
const module = async (message:Message, client:Client) => {
    const { content} = message;
    try {
        if (message.channel.id == "1112164583344443433") return;
        if (/^\.\s*dl\s+https/i.test(content)) return message.delete();

        if (message.author.id != "439205512425504771") return;
        if (message.embeds.length > 0) {
            // embeds
            let args = message.embeds[0].title;
            if (args) {
                if (args.match(/Command Error/gim) != null) {
                    setTimeout(async () => {
                        await message.delete()
                    }, 5000);
                }
            }
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module
