import Client from "../../interfaces/ICustomClient.js"
import { ColorResolvable, EmbedBuilder } from "discord.js"
import config from "../../config.json" with {type: "json"}
const link = "https://www.bcv.org.ve/";

const twitterPhoto =
    "https://pbs.twimg.com/profile_images/927966724753944577/SAw5bHeo_400x400.jpg";

const module = async (client: Client) => {
    try {
        if (!client.user) return
        const botAvatar = client.user.displayAvatarURL();
        const data = await fetch("https://pydolarve.org/api/v1/dollar")
            .then(res => res.json())
        const fecha = data.datetime.date
        const hora = data.datetime.time

        const bcv_dolar = data.monitors.bcv.price
        const bcv_simbolo = data.monitors.bcv.symbol
        const bcv_change = data.monitors.bcv.change
        const logo = data.monitors.bcv.image

        const monitor_dolar = data.monitors.enparalelovzla.price
        const monitor_simbolo = data.monitors.enparalelovzla.symbol
        const monitor_change = data.monitors.enparalelovzla.change
        //const data = await fetch(link)
        //    .then(response => response.text())
        //const $ = load(data);
        //const dolar = $("#dolar div.col-sm-6.col-xs-6.centrado");
        //const euro = $("#euro div.col-sm-6.col-xs-6.centrado");
        //const fecha = $(
        //    "div.pull-right.dinpro.center span.date-display-single"
        //);
        const embed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR as ColorResolvable)
            .setTitle(`Monitor Dólar`)
            .setAuthor({ name: "Bot sin Contexto", iconURL: botAvatar })
            .setThumbnail(logo).setDescription(`\
                ## BCV
                💵 Dólar Bs: ${bcv_dolar} ${bcv_simbolo}${bcv_change}\n\
                🌐 **[@BCV_ORG_VE](https://bcv.org.ve)**\
                \n## Paralelo\n\
                💵 Dólar Paralelo Bs: ${monitor_dolar} ${monitor_simbolo}${monitor_change}\
                \n## Promedio\n\
                💵 Dólar Promedio Bs: ${(monitor_dolar + bcv_dolar) / 2}\n
                ${fecha}️ ${hora}
                `);
        return embed;
        //💶 Euro Bs: ${euro.text().substring(0, 6)}\n\
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd());
    }
};

export default module
