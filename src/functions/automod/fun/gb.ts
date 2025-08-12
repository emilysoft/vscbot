import { Message } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js"

export default {
    name: "gb",
    vscOnly: true,
    ignoreBots: true,
    allowEdited: false,
    execute: async function (message: Message, client: Client) {
        try {
            const regex = /\.\s*t\s+g\s*b/gim;
            if (message.content.match(regex) != null) await message.delete();
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ")
        }
    }
}