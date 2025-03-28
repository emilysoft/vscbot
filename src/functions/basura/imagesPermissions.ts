//import { Message } from "discord.js";
//import Client from "../../../interfaces/ICustomClient.js"
//import Iautomod from "../../../interfaces/Iautomod.js"
//const regex = /(pegan|pasar|enviar|manda(r|n))\s+([a-zA-Z]+\s+)?(gifs?|videos?|capturas?|im(a|á)genes|imagen|fotos?|videos|m(e|o)m(o|e)s)/gim
//
//export default {
//    name:"imagesPermissions",
//    ignoreBots: true,
//    execute: async function(message:Message,client:Client) {
//        try {
//            if(message.content.match(regex) != null) {
//                await message.reply({
//                    content: "Necesitas ser nivel 5 para enviar imágenes aquí, ¡súbelo escribiendo! usas <#813562445729628170> mientras tanto <:pulgarcito:998584055392124959>",
//                    allowedMentions: { repliedUser: false },
//                });
//            }
//        } catch (err) {
//            client.errorLogger(err, client, "error", process.cwd() + " ");
//        }
//    }
//} as Iautomod