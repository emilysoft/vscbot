import {Message} from "discord.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
export default {
    name:"deleteMee6",
    vscOnly: false,
    ignoreBots: true,
    execute: async function(message:Message,client:Client) {
        try {
            const { author, content } = message;
            if (
                author.id == "159985870458322944" &&
                content.match(/1023633373731766312/gim) == null &&
                message.embeds.length == 0
            ) {
                await message.delete();
            }
        } catch (err:any) {
            if(err.code == 10008) return
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod