const errorLogger = require("../../loggers/errorLogger");
const { EmbedBuilder } = require("discord.js");
const chiste2 = `Borré tu mensaje porque es muy largo, usa <#853387980335874078>`;
const vscLog = require("../../loggers/automodLogger");
const {
    EMBED_COLOR,
    ignoredChannels,
    backupChannel,
    ignoredCategories
} = require("../../../config.json");
module.exports = async (message, client) => {
    try {
        const limiteCaracteres = 600;
        const excepciones = {
            outOfContextRoleId: "813549579097735229",
            moderacionRoleId: "813568302294761486",
            SilenciadoRoleId: "813572971338792962",
            mutedRoleId: "936077832747118652",
        };

        //EXCEPCIONES
        if (message.channel.isThread()) return; // evitar hilos
        if (
            //evitar bots excepto notsobot
            message.author.bot == true &&
            message.author.id != "439205512425504771"
        )
            return;
        if (
            message.author.id == "302249242469335060" ||
            message.author.id == "690796358579257424"
        )
            return; //evitar owner
        for (let key in excepciones) {
            if (
                message.member.roles.cache.some(
                    (role) => role.id === excepciones[key]
                )
            )
                return;
        }
        if (message.channel.parentId === "813564411628355625") return; //administracion
        //if (message.channel.parentId === "") return; // registro
        if (message.channel.parentId === "874730574089187359") return; //extralaborales

        if (Object.values(ignoredCategories).includes(message.channel.parentId)) return; //evitar categorias ignoradas 
        if (Object.values(ignoredChannels).includes(message.channelId)) return; //evitar canales ignorados
        if (message.channel.name.startsWith("ticket")) return; //evitar canales de tickets

        //COMPROBACION
        if (message.content.length > 0) {
            // contenido en texto
            let args = message.content;

            // antinewlines
            if (message.author.bot && args.match(/(.*\n){10,}/gm))
                action(message, client, args);
            // antiwalltexts
            if (args.length > limiteCaracteres) action(message, client, args);
        } else if (message.embeds.length > 0) {
            // embeds
            let args = message.embeds[0].description;
            if (args)
                if (args.length > limiteCaracteres)
                    action(message, client, args);
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};

async function action(message, client, args) {
    await message.delete();
    const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
    const botAvatar = client.user.displayAvatarURL();
    const botsChannel = client.channels.cache.find(
        (channel) => channel.id === backupChannel
    );
    const messageFormated = args.replace(/`/g, "");

    //envia el textWall a bots
    const exampleEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`Mensaje borrado`)
        .setAuthor({
            name: message.author.username,
            iconURL: avatarPhoto,
        })
        .setDescription(`\`\`\`\n${messageFormated}\`\`\``)
        .setTimestamp()
        .setFooter({
            text: "automod",
            iconURL: botAvatar,
        });
    await botsChannel.send({
        content: `<@${message.author.id}>`,
        embeds: [exampleEmbed],
    });

    //envia avisa del mensaje borrado
    await message.channel
        .send(`<@${message.author.id}>` + chiste2)
        .then(async (msg) => {
            setTimeout(async () => {
                await msg.delete();
            }, 10000);
        });

    //logea la situacion
    vscLog(
        message,
        client,
        "Un text wall fue borrado",
        `<@${message.author.id}> pasó un texto demasiado largo`
    );
}
