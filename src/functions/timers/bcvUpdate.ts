import { DateTime } from "luxon";
import getBCVdata from "../lib/getBCVdata.js";
import { TextChannel } from "discord.js";
const targetChannel = "1294633642865332287";
import Client from "../../interfaces/ICustomClient.js";
const role = "<@&830121766801244160>";
const module = async (now: Date, client: Client) => {
    try {
        const day = now.getDay();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const channel = client.channels.cache.find(
            (c) => c.id === targetChannel
        );

        if (channel instanceof TextChannel != true) return console.log("canal de dolar no conseguido")
        if (day == 0 || day == 6) {
            if ((hour == 9 || hour == 13) && minutes == 35)
                return sendMessage(client, channel);
            else if (hour == 17 && minutes == 0) {
                const embed = await getBCVdata(client);
                if (channel instanceof TextChannel != true || !embed) return;
                await channel.send({
                    content: "Última actualización del día",
                    embeds: [embed],
                });
            }
        }
        //else {
        //    if (hour == 9 && minutes == 0) 
        //        return sendMessage(client, channel, role);
        //    if (hour == 13 && minutes == 35) sendMessage(client, channel);
        //    if (hour == 17 && minutes == 0) {
        //        const embed = await getBCVdata(client);
        //        if (channel instanceof TextChannel != true || !embed) return;
        //        await channel.send({
        //            content: "Última actualización del día",
        //            embeds: [embed],
        //        });
        //    }
        //}
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};
async function sendMessage(client: Client, channel: TextChannel, rol = "") {

    const embed1 = await getBCVdata(client);

    if (channel instanceof TextChannel != true) return;
    if (!embed1) return
    await channel.send({
        content: `Ya subió el dólar marico! ${rol}`,
        //files: [getData()],
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

export default module;
