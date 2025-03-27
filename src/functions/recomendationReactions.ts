import { Message } from "discord.js";
import errorLogger from "./loggers/errorLogger.js"
import Client from "../classes/ICustomClient.js"
const module = async (message:Message, targetChannel:string, type:string, client:Client) => {
    try {
        const attachments = message.attachments.size;  
        const isURL = message.content.match(/https/gim)

        if (message.channel.id != targetChannel) return;
        if(attachments < 1 && !isURL) return 

        switch(type) {
            case "heart":
                await message.react("❤");
                break;
            case "memes": 
                await message.react("<:xd:1116468520885162025>");
                await message.react("<:kek:1116461713563328572>");
                break;
            case "nsfw":
                await message.react("<:smash:1328038080334270516>");
                await message.react("<:pass:1328037817816973413>");
                break;
            case "galeria":
                await message.react("<:kek:1116461713563328572>");
                await message.react("❤");
                await message.react("<:weabolike:1116479128305143902>");
                await message.react("<:wow:1116468515399012434>");
                break;
            default: 
                await message.react("👍")
                await message.react("👎");
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};
export default module
