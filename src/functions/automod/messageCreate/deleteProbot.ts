import {Message} from "discord.js"
import Client from "../../../classes/ICustomClient.js"
import errorLogger from "../../loggers/errorLogger.js"
const module = async (message:Message, client:Client) => {
    try {
        const { author, content } = message;
        if (author.id != "282859044593598464") return;
        if(message.channel.id == "813538324320092164") return
        if(content.match(/virgo/gim) != null)
        {
            setTimeout(async () => {
                await message.delete();
            }, 3500)
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module
