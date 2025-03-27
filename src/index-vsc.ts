import Client from "./interfaces/ICustomClient.js";
const client = new Client();
import loadSlashCommands from "./handlers/loadSlashCommands.js";
import loadCommands from "./handlers/loadCommands.js";
import loadEvents from "./handlers/loadEvents.js";
import dotenv from "dotenv";
import loadAutomod from "./handlers/loadAutomod.js";
dotenv.config();
loadSlashCommands(client)
loadCommands(client)
loadEvents(client)
loadAutomod(client)

//nodejs-listeners
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
process.on("uncaughtExceptionMonitor", (e) => console.error(e));

client
    .login(process.env.TOKEN)
    .catch((err) =>
        console.log(
            `Dont possible connect with discord - Reason: "${err.message}"`
        )
    );
client.on("ready", () => console.log("iniciado"));
export default client;

//import tags from "./tags.json" with {type:"json"}
//const regex= /{attach\:(https\:\/\/(cdn|media)\.discordapp\.(net|com)\/attachments\/\d+\/\d+\/[\w\.\?\d=&]+)}/
//const regex2 = /(\.(jpe?g|png|mp4|webm|webp))/
//const etiquetas: Array<object> = [] 
//for(const tag of tags.tags) {
//    const match = tag.content.match(regex)
//    if(match) 
//    {
//        let name = match[1].match(regex2)
//
//        if(name) {
//            etiquetas.push({
//                name: tag.name,
//                format: tag.name + name[1],
//                url: match[1]
//            })
//        }
//    }
//}
//client.on("ready", async () => {
//    const guild = client.guilds.cache.get("813538324320092161")
//    if(!guild) return console.log("guild no encontrado")
//    const channel = await guild.channels.fetch("1330886107512180746")
//    if (channel instanceof TextChannel != true) return console.log("canal no encontrado")
//
//    try {
//        for(const etiqueta of etiquetas) {
//
//        }
//        await channel.send({
//            content:
//        })
//    } catch(err) {
//        console.log(err)
//    }
//
//})
//client.on("messageCreate", message => {
//
//})
//import fs from "fs";
//async function downloadImageNode(imageUrl:string, filename = 'image.jpg') {
//	console.log(imageUrl)
//  try {
//    await fetch(imageUrl).then(async response => {
//        if (!response.ok) {
//        throw new Error(`HTTP error! status: ${response.status}`);
//        }
//        if(!response) return
//        const buffer = await response.arrayBuffer(); // Obtén el contenido como un Buffer
//        const clamped = new Uint8ClampedArray(buffer);
//        // Escribe el buffer en un archivo
//        fs.writeFileSync(filename, clamped);
//        console.log(`Imagen descargada correctamente como ${filename}`);
//
//  })
//    } catch (error) {
//        console.error('Error al descargar la imagen:', error);
//    }
//}
////
////
////client.on("ready", async () => {
////    const guild = client.guilds.cache.get("813538324320092161");
////    if (!guild) return console.log("guild not found");
////
////    const naranja = "1301497410345762867";
////    const negro = "1301500519436783636";
////
////    const members = await guild.members.fetch();
////    let status = false;
////    members.forEach(async member => {
////        if (member.roles.cache.has("1272564404193460286")) return;
////        if (member.roles.cache.has("1260331890406068325")) return;
////        if (status) {
////                status = false;
////            await member.roles.add(naranja).then((m) => {
////                console.log(`agregado naranja a ${m.user.username}`);
////            });
////        } else {
////                status = true;
////            await member.roles.add(negro).then((m) => {
////                console.log(`agreado negro a ${m.user.username}`);
////            });
////        }
////    })
////});
////
////import canales from "./canales.json" with {type:"json"}
////client.on("ready", async() => {
////    const guild = client.guilds.cache.get("813538324320092161")
////    if(!guild) return console.log("guild not found")
////
////    const channels = await guild.channels.fetch()
////    if(!channels) return
////    const channelsToChange = channels.filter(channel => canales.some(cnl => cnl.id === channel?.id))
////    let canal;
////    channelsToChange.forEach(async channel => {
////       canal = canales.find((cnl:any) => cnl.id == channel?.id)
////       if(!channel) return
////       if(!canal) return
////       await channel.edit({name:canal.navidad})
////       .then(c=> {
////            console.log(`canal cambiado: ${c.name}`)
////       })
////       .catch(e => console.log(e))
////    })
////})
////
