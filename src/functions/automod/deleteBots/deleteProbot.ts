import { Message } from "discord.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"

export default {
    name: "deleteProbot",
    scope: "guild",
    ignoreBots: false,
    execute: async function (message: Message, client: Client) {
        try {
            const { author, content } = message;
            if (author.id != "282859044593598464") return;
            if (message.channel.id == "813538324320092164" || message.channel.id == "1345943077470076979") return
            if (content.match(/ahora eres nivel/gim) != null) {
                setTimeout(async () => {
                    message.delete();
                }, 3500)
            }
        } catch (err: any) {
            if (err.code == 10008) return
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod
