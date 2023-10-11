const { Agent } = require("https");
const { get } = require("axios");
const { load } = require("cheerio");
const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../config.json");
const errorLogger = require("./loggers/errorLogger");
const link = "https://www.bcv.org.ve/";
const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

const twitterPhoto =
    "https://pbs.twimg.com/profile_images/927966724753944577/SAw5bHeo_400x400.jpg";

module.exports = async (client) => {
    try {
        const botAvatar = client.user.displayAvatarURL();
        const { data } = await get(link, { httpsAgent });
        const $ = load(data);
        const dolar = $("#dolar div.col-sm-6.col-xs-6.centrado");
        const euro = $("#euro div.col-sm-6.col-xs-6.centrado");
        const fecha = $(
            "div.pull-right.dinpro.center span.date-display-single"
        );
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`Banco Central de Venezuela`)
            .setAuthor({ name: "Bot sin Contexto", iconURL: botAvatar })
            .setThumbnail(twitterPhoto).setDescription(`💵 Dólar Bs: ${dolar
            .text()
            .substring(0, 6)}\n\
                    💶 Euro Bs: ${euro.text().substring(0, 6)}\n\
                    🗓️ Fecha Valor: ${fecha.text()}️\n\
                    🌐 **[@BCV_ORG_VE](https://twitter.com/BCV_ORG_VE)**`);
        return embed;
    } catch (err) {
        errorLogger(err, client, "error");
    }
};
