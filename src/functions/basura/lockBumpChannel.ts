//import {Role, TextChannel} from "discord.js"
//import Client from "../../interfaces/ICustomClient.js"
//import errorLogger from "../loggers/errorLogger.js"
//const vscID = "813538324320092161";
//const targetChannelId = "813796911994896397";
//
//export default async (hoy:Date, client:Client) => {
//    try {
//        async function getChannel() {
//            const vsc = client.guilds.cache.get(vscID);
//            if(!vsc) return
//            let targetChannel = vsc.channels.cache.find(
//                (channel) => channel.id === targetChannelId
//            );
//            while (typeof targetChannel == "undefined") {
//                targetChannel = vsc.channels.cache.find(
//                    (channel) => channel.id === targetChannelId
//                );
//            }
//            return targetChannel;
//        }
//        async function openChannel() {
//            const vsc = client.guilds.cache.get(vscID);
//            if(!vsc) return
//            const everyone = vsc.roles.cache.find((r) => r.id === vscID);
//            const channel = await getChannel();
//            if(channel instanceof TextChannel) 
//            channel.permissionOverwrites
//                .edit(everyone as Role, { SendMessages: true })
//                .then(() => {
//                    console.log(`El canal bump ha sido abierto. ${hoy} `);
//                    channel.send(
//                        `Buenos días, ya puedes bumpear **/bump**  <@&1015669369218539641>`
//                    );
//                });
//        }
//        async function closeChannel() {
//            const vsc = await client.guilds.cache.get(vscID);
//            if(!vsc) return
//            const everyone = vsc.roles.cache.find((r) => r.id === vscID);
//            const channel = await getChannel();
//            if(channel instanceof TextChannel != true) return
//            channel.permissionOverwrites
//                .edit(everyone as Role, { SendMessages: false })
//                .then(() => {
//                    console.log(`el canal bump ha sido cerrado ${hoy}`);
//                    channel.send("Canal cerrado hasta mañana a las 8am.");
//                });
//        }
//
//        if (hoy.getHours() == 22 && hoy.getMinutes() == 0) {
//            closeChannel();
//            // cierra el canal a las
//        } else if (
//            hoy.getHours() == 15 &&
//            hoy.getMinutes() == 0 &&
//            hoy.getDay() == 6
//        ) {
//            closeChannel();
//        }
//        // abre el canal a las 8am
//        else if (hoy.getHours() == 8 && hoy.getMinutes() == 0) {
//            openChannel();
//        }
//    } catch (err) {
//        errorLogger(err, client, "error", process.cwd() + " ");
//    }
//};
//