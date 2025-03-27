import { Message, TextChannel } from "discord.js"
import errorLogger from "../../loggers/errorLogger.js"
import Client from "../../../classes/ICustomClient.js"
const module = async (message: Message, client:Client) => {
    try {
        if(message.author.bot) return 
        if(message.channel.id != "1073774467282641038") return
        if(message.channel instanceof TextChannel !=true) return

        const ask = message.content
        if(!ask) return 
        await message.react("🕒")
        await message.channel.sendTyping()
        const reply = message.reference?.messageId
        let prompt = ""
        if(reply) {
            const replyMessage = await message.channel.messages.fetch(reply)
            prompt = replyMessage.content + "Mi pregunta ahora es:" + ` ${ask}`
                        .replace(/:smile:/gim, "<:a_heart:1116461880924446741>")

        } else {
            const iaUser =  client.iaUser.get(message.author.id)
            if(iaUser) { 
                prompt = `tu dijiste: ${iaUser}, ahora yo digo: ${ask}`
            } else {
            prompt = ask;
            //`Sigue estas instrucciones para responder a la pregunta:
            //        1. Sé breve
            //        2. Usa Markdown cuando necesites resaltar algo.
            //        ${ask}
            //    `;
            //prompt = `responde de manera alegre,\
            //pasa del saludo y ve directo al grano de mis preguntas,\
            //no hables formal,\
            //usa palabras que son usadas del dia a dia,\
            //ten en mente que le escribes a un persona joven,\
            //no uses markdown,\
            //escribe todo en 1 parrafo,\
            //eres de venezuela pero no hables del pais,\
            //usa jerga venezolana pero no abuses usarla,\
            //usa lenguaje inclusivo,\
            //cuando quieras decir chido di chevere,\
            //responde resumidamente,\
            //no uses emojis: ${ask}`
            }
        }

        //if(!replyMessage?.author.bot) return
        //fetch(`https://large-cerebras.vercel.app/api/code?prompt=${encodeURIComponent(prompt)}`)
        fetch(`https://gemini-rest.vercel.app/api/?prompt=${encodeURIComponent(prompt)}`)
            .then(res => res.json())
            .then(res => {
                    //let mm=res
                    //    .replace(/Hola/m, "<:holaGawr:1116468570306642020> hola")
                    //    .replace(/¡/gm, "")
                    //    .replace(/¿/gm, "")
                client.iaUser.set(message.author.id, res.response)
                sendMessage(message, res.response)
            })
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
}

async function sendMessage(message:Message, mensaje:string) {
    if(mensaje == "") return
    if(mensaje.length < 2000) return  await message.reply({
        content: mensaje
        .replace(/@everyone/gim, "everyone")
        .replace(/@here/gim, "here"),
        allowedMentions: { parse: [], repliedUser: false}
    }).then(() => {
        message.reactions.removeAll()
    })

    let start = mensaje.slice(0,2000)
        .replace(/@everyone/gim, "everyone")
        .replace(/@here/gim, "here")
    let end = mensaje.slice(2000)

    await message.reply(start)
        .then(msg => {
            sendMessage(msg, end)
        })
}
export default module 
