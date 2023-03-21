const https = require("https");
const Axios = require("axios");
const cheerio = require("cheerio");
const { EmbedBuilder } = require("discord.js");
const errorLogger = require("./loggers/errorLogger");
const link = "https://www.bcv.org.ve/";
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
const botAvatar =
    "https://cdn.discordapp.com/avatars/883827073049845801/c821a559d8df0079beb33abf9c6eeeda.png?size=96&quality=lossless";
const twitterPhoto =
    "https://pbs.twimg.com/profile_images/927966724753944577/SAw5bHeo_400x400.jpg";

module.exports = async (message, reply) => {
    try {
        if (reply) {
            message.channel.send("Cargando...").then(async (msg) => {
                const obj = await getData();
                msg.edit({ content: "", embeds: [obj] });
            });
        } else {
            const obj = await getData();
            message.channel
                .send({ embeds: [obj] })
        }
        async function getData() {
            const { data } = await Axios.get(link, { httpsAgent });
            const $ = cheerio.load(data);
            const dolar = $("#dolar div.col-sm-6.col-xs-6.centrado");
            const euro = $("#euro div.col-sm-6.col-xs-6.centrado");
            const fecha = $(
                "div.pull-right.dinpro.center span.date-display-single"
            );
            const exampleEmbed = new EmbedBuilder()
                .setColor("#ADD8E6")
                .setTitle(`Banco Central de Venezuela`)
                .setAuthor({ name: "Bot sin Contexto", iconURL: botAvatar })
                .setThumbnail(twitterPhoto).setDescription(`💵 Dólar Bs: ${dolar
                .text()
                .substring(0, 6)}\n\
                    💶 Euro Bs: ${euro.text().substring(0, 6)}\n\
                    🗓️ Fecha Valor: ${fecha.text()}️\n\
                    🌐 **[@BCV_ORG_VE](https://twitter.com/BCV_ORG_VE)**`);
            return exampleEmbed;
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
