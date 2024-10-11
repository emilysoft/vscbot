import errorLogger from "../../loggers/errorLogger.js"
import { EmbedBuilder } from "discord.js"
const aviso = `Mensaje borrado por texto excesivo. Usa <#1112164583344443433>`;
import vscLog from "../../loggers/automodLogger.js"
import isNumberInMessage from "./isNumberInMessage.js"
import config from "../../../config.json" with {type:"json"}

const module = async (message, client) => {
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
        if (message.channel.parentId === "1169624626188521563") return; // registro principales
        if (message.channel.parentId === "1120080747668197436") return; // registro secundarios
        if (message.channel.parentId === "874730574089187359") return; //extralaborales
        if (message.channel.id === "1005354020333948988") return;       //basados
        if (message.author.id == "1095572785482444860") return; // hiraku
        if (Object.values(config.ignoredCategories).includes(message.channel.parentId))
            return; //evitar categorias ignoradas
        if (Object.values(config.ignoredChannels).includes(message.channelId)) return; //evitar canales ignorados
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
        errorLogger(err, message.client, "error", import.meta.url);
    }
};

async function action(message, client, args) {
    try {
        await message.delete();
        const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        const botAvatar = client.user.displayAvatarURL();
        const botsChannel = client.channels.cache.find(
            (channel) => channel.id === config.backupChannel
        );
        const messageFormated = args.replace(/`/g, "");

        //envia el textWall a bots
        const exampleEmbed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR)
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

        if (message.author.bot) return;

        //envia aviso del mensaje borrado
        await message.channel
            .send(`<@${message.author.id}>` + aviso)
            .then(async (msg) => {
                setTimeout(async () => {
                    await msg.delete();
                }, 10000);
            });

        // Hace un backup en el dm si esta abierto o en un canal del servidor
        await message.member.user
            .createDM()
            .then((dm) => {
                dm.send({
                    content: `${aviso}`,
                    embeds: [exampleEmbed],
                }).catch((err) => {
                    // Envia el backup en el canal de bots
                    if (err.code == 50007) {
                        if (isNumberInMessage(message)) return;
                        botsChannel.send({
                            content: `<@${message.author.id}> ${aviso}`,
                            embeds: [exampleEmbed],
                        });
                    } else errorLogger(err, message.client, "error", import.meta.url);
                });
            })
            .then(() => {
                vscLog(
                    message,
                    client,
                    "Un text wall fue borrado",
                    `<@${message.author.id}> pasó un texto excesivo`
                );
            });

        //logea la situacion
    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
}

export default module
