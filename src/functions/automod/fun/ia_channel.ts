import { Message, TextChannel } from "discord.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
import ia from "./../../lib/ia.js"
export default {
    name: "ia",
    vscOnly: true,
    ignoreBots: true,
    execute: async function (message: Message, client: Client) {
        try {
            if (message.channel.id != "1073774467282641038") return
            if (message.channel instanceof TextChannel != true) return

            const ask = message.content
            if (!ask) return
            await message.channel.sendTyping()
            const reply = message.reference?.messageId
            let prompt = ""
            if (reply) {
                const replyMessage = await message.channel.messages.fetch(reply)
                prompt = replyMessage.content + "Mi pregunta ahora es:" + ` ${ask}`
                    .replace(/:smile:/gim, "<:a_heart:1116461880924446741>")

            } else {
                const iaUser = client.iaUser.get(message.author.id)
                if (iaUser) {
                    prompt = `tu dijiste: ${iaUser}, ahora yo digo: ${ask}`
                } else {
                    prompt = ask;
                }
            }

            const response = await ia(prompt)
            if(!response) return message.reply("hubo un error con la API, intenta de nuevo") 
            client.iaUser.set(message.author.id, response)
            sendMessage(message, response)
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod


async function sendMessage(message: Message, mensaje: string) {
    if (mensaje == "") return
    if (mensaje.length < 2000) return await message.reply({
        content: mensaje
            .replace(/@everyone/gim, "everyone")
            .replace(/@here/gim, "here"),
        allowedMentions: { parse: [], repliedUser: false }
    })
    let start = mensaje.slice(0, 2000)
        .replace(/@everyone/gim, "everyone")
        .replace(/@here/gim, "here")
    let end = mensaje.slice(2000)

    await message.reply(start)
        .then(msg => {
            sendMessage(msg, end)
        })
}
