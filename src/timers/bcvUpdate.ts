import { DateTime } from "luxon"
import getBCVdata from "../functions/getBCVdata.js"
import {  TextChannel } from "discord.js"
import errorLogger from "../functions/loggers/errorLogger.js"
const targetChannel = "1240285460195049622";
import Client from "../classes/ICustomClient.js"
const module = {
    async updateMonitor(now: Date, client: Client) {
        try {
            const role = "<@&830121766801244160>";
            const day = now.getDay();
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const channel = client.channels.cache.find(
                (c) => c.id === targetChannel
            );

            if(channel instanceof TextChannel != true) return
            if (day == 0 || day == 6) {
                if ((hour == 9 || hour == 13) && minutes == 35)
                    sendMessage(client, channel);
                else if (hour == 17 && minutes == 0) {
                    const embed = await getBCVdata(client);
                    if(channel instanceof TextChannel != true || !embed) return
                    channel.sendTyping()
                    await channel.send({
                        content: "Última actualización del día",
                        embeds: [embed],
                    });
                }
            } else {
                if (hour == 9 && minutes == 35) sendMessage(client, channel);
                if (hour == 13 && minutes == 35) sendMessage(client, channel);
                if (hour == 17 && minutes == 0) {
                    const embed = await getBCVdata(client);
                    if(channel instanceof TextChannel != true || !embed) return
                    channel.sendTyping()
                    await channel.send({
                        content: "Última actualización del día",
                        embeds: [embed],
                    });
                }
            }
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};
async function sendMessage(client:Client, channel:TextChannel, role = "") {
    const monitorAvatar =
        "https://pbs.twimg.com/profile_images/1111629538646216705/kLOBbRXR_400x400.jpg";
    const twitter = "[@MonitorDolarVla](https://twitter.com/monitordolarvla)";
    const embed1 = await getBCVdata(client);


    if(channel instanceof TextChannel != true || !embed1) return
    channel.sendTyping()
    await channel.send({
        content: `Ya subió el dólar marico! ${role}`,
        files: [getData()],
        embeds: [embed1],
    });
}
function getData() {
    let vip = "";
    const excludeDays = ["sabado", "sábado", "domingo"];

    const now = DateTime.now().setZone("America/Caracas");
    const hour = now.hour >= 9 && now.hour < 13 ? 9 : 1;
    const day = now.weekdayLong;

    console.log(day);
    if (excludeDays.includes(day as string)) {
        vip = "vip-";
    }

    const urlImagen = `https://mdwcoder.com/app/img-historial/${now.toFormat(
        "dd"
    )}/${now.toFormat("MM")}/20${now.toFormat("yy")}/${vip}${hour}.1.jpg`;

    console.log(urlImagen);
    return urlImagen;
}

export default module
