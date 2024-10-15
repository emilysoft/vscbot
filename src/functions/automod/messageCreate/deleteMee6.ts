import {Message} from "discord.js"
import Client from "../../../classes/ICustomClient.js"
import errorLogger from "../../loggers/errorLogger.js"
const module = async (message:Message, client:Client) => {
    try {
        const { author, content } = message;
        if (
            author.id == "159985870458322944" &&
            content.match(/1023633373731766312/gim) == null &&
            message.embeds.length == 0
        ) {
            await message.delete();
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module
