const fs = require("fs")
const path = require("path")
const { Client, Collection} = require("discord.js");
const { token } = require("./config.json");
const client = new Client({ intents: [34571] });
client.iaUser = new Collection();
require("./handlers/loadSlashCommands")(client);
require("./handlers/loadCommands")(client);
require("./handlers/loadEvents")(client);

//nodejs-listeners
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
process.on("uncaughtExceptionMonitor", (e) => console.error(e));

client.login(token).catch((err) => {
    console.log(
        `Dont possible connect with discord - Reason: "${err.message}"`
    );
});
//const canales = require("./canales.json")
//client.on("ready", ()=> {
//    const guild = client.guilds.cache.get("813538324320092161")
//    if(!guild) return console.log("guild no conseguida")
//
//    guild.channels.cache.forEach(channel => {
//        const canal = canales.find(canal => canal.id === channel.id)
//        if(!canal) return
//        console.log(canal.halloween)
//        channel.edit({name:canal.halloween})
//    })
//})
//client.on("messageCreate", async message => {
//    const ask = message.content
//    if(message.channel.id == "813538324320092164") {
//        if(message.content.startsWith("=")) {
//            setTimeout(() => {
//                message.delete()
//            },1000)
//        }
//    }
//    else if(message.author.id == "356268235697553409") {
//        setTimeout(() => {
//            message.delete()
//        },1000)
//    }
//
//    if(message.author.bot) return 
//
//
//    if(message.channel.id == "1073774467282641038")  return  message.reply("Hey aún me faltan ciertos cambios para funcionar completamente\
//    en este canal pero no te preocupes que pronto estare para responder tus preguntas")
//
//    //if(message.channel.id != "1073774467282641038") return
//    if(message.channel.id != "1024260771326197781") return
//    //let prompt = `sabes programar en pawn,\
//    //recuerda que pawn usa la sintaxis de C\
//    //y sabes hacer servidores de samp ${ask}`
//    const reply = message.reference?.messageId
//    let replyMessage = ""
//    let prompt = ""
//    if(reply) {
//        replyMessage = await message.channel.messages.fetch(reply)
//        prompt = replyMessage.content + "Mi pregunta ahora es:" + ` ${ask}`
//                    .replace(/hola/m, "<:holaGawr:1116468570306642020> hola")
//                    .replace(/:smile:/gim, "<:a_heart:1116461880924446741>")
//
//    } else {
//        //prompt = `quiero que analices el siguiente mensaje,\
//        //de encontrar algo grosero o ilegal escribiras <@302249242469335060> al principio de tu respuesta,\
//        //de no encontrar nada grosero o ilegal no escribiras el <@302249242469335060>,\ 
//        //este el mensaje:${ask}`
//
//        prompt = `responde de manera alegre,\
//        pasa del saludo y ve directo al grano de mis preguntas,\
//        no hables formal,\
//        usa palabras que son usadas del dia a dia,\
//        ten en mente que le escribes a un persona joven,\
//        no uses markdown,\
//        escribe todo en 1 parrafo,\
//        eres de venezuela pero no hables del pais,\
//        usa jerga venezolana pero no abuses usarla,\
//        usa lenguaje inclusivo,\
//        cuando quieras decir chido di chevere,\
//        responde resumidamente,\
//        no uses emojis: ${ask}`
//        //prompt = `pasa del saludo y ve directo al grano,\
//        //no hables formal,\
//        //usa palabras que son usadas del dia a dia,\
//        //ten en mente que le escribes a un persona joven,\
//        //responde resumidamente,\
//        //responde con la menor cantidad de palabras posibles,\
//        //trata de explicar directamente con codigo si te pregunto algo sobre programacion\
//        //no uses emojis: ${ask}`
//    }
//
//    //if(!replyMessage?.author.bot) return
//    fetch(`https://gemini-rest.vercel.app/api/?prompt=${encodeURIComponent(prompt)}`)
//      .then(res => res.json())
//        .then(res => {
//                let mm=res.response
//                    .replace(/hola/m, "<:holaGawr:1116468570306642020> hola")
//                    .replace(/¡/gm, "")
//                    .replace(/¿/gm, "")
//                    .replace(/:smile:/gim, "<:a_heart:1116461880924446741>")
//            sendMessage(message, mm)
//        })
//})
//
//
//
//
//async function sendMessage(message, mensaje) {
//    if(mensaje == "") return
//    if(mensaje.length < 2000) return  await message.reply(mensaje
//        .replace(/@everyone/gim, "everyone")
//        .replace(/@here/gim, "here")
//    )
//
//    let start = mensaje.slice(0,2000)
//        .replace(/@everyone/gim, "everyone")
//        .replace(/@here/gim, "here")
//    let end = mensaje.slice(2000)
//
//    await message.reply(start)
//        .then(msg => {
//            sendMessage(msg, end)
//        })
//}
////client.on("messageCreate", async message => {
////   if(message.channel.id == "813572562721439764")
////       await message.delete()
////})
////client.on("ready", () => {
////     const guild = client.guilds.cache.get("813538324320092161")
////     if(!guild) return console.log("servidor no conseguido");
////   //const channel = guild.channels.cache.get("813538324320092164"); 
////   // if(!channel)  return console.log("canal no conseguido")
////
////     const file = fs.readFileSync(path.join(process.cwd() + "/clipboard2.txt"), "utf8")
////       //channel.send("baneando usuarios de gg/gaitasclub, por favor espere") 
////     file.split("\n").forEach(async line => {
////         let user = await client.users.fetch(line)
////         await guild.members.ban(user, {reason:"Usuario sospechoso"})
////             .then(()=> {
////                 console.log(`Baneado exitosamente: ${user.username}`)
////                 //channel.send(`Baneado exitosamente: ${user.username}`)
////             })
////             .catch(err => {
////                 console.log(`No pudo ser baneado: ${user.username} ${err}`)
////                 fs.writeFileSync(path.join(process.cwd() + "error.txt"), line + "\n", {flag:"a+"})
////             })
////     })
////})
