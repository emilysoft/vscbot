import {Message} from "discord.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
const regex = /(hello|hi|i'll|i will).*(help|teach).*(earn|profit|crypto).*(\d{1,3}k\$?|doubts|the first|\d{1,3} hours).*(crypto|commission|profit)/gim;
export default {
    name:"antiCrypto",
    ignoreBots: true,
    execute: async function(message:Message,client:Client) {
        try {
            if (message.author.id == "439205512425504771") return;// posiblemente es nsb
            if (message.content.match(regex) != null) {
                if(!message.member) return
                if (message.member.roles.cache.some((role) => role.id === lvl10))
                    return;
                if (message.member.roles.cache.some((role) => role.id === lvl5))
                    return;
                await message.delete();
                message.member.ban({ reason: "scammer bot" });
                client.automodLogger(
                    message,
                    client,
                    "Scammer bot",
                    "ha sido baneado por enviar scam"
                );
            }
        } catch (err:any) {
            if(err.code == 10008) return
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod