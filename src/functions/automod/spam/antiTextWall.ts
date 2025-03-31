import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
import { ColorResolvable, TextChannel, Message, EmbedBuilder, Role, DMChannel } from "discord.js"
const aviso = `Mensaje borrado por texto excesivo. Usa <#1112164583344443433>`;
import isNumberInMessage from "./../../lib/isNumberInMessage.js"
import config from "../../../config.json" with {type: "json"}
interface Excepciones {
    outOfContextRoleId: string,
    moderacionRoleId: string,
    SilenciadoRoleId: string,
    mutedRoleId: string,
}
export default {
    name: "antiTextWall",
    ignoreBots: false,
    vscOnly: true,
    execute: async function (message: Message, client: Client) {
        try {
            const limiteCaracteres = 600;
            const excepciones: Excepciones = {
                outOfContextRoleId: "813549579097735229",
                moderacionRoleId: "813568302294761486",
                SilenciadoRoleId: "813572971338792962",
                mutedRoleId: "936077832747118652",
            }
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
            if (!message.member) return
            for (let key in excepciones) {
                if (
                    message.member.roles.cache.some(
                        (role: Role) => role.id === excepciones[key as keyof Excepciones]
                    )
                )
                    return;
            }
            if (message.channel instanceof TextChannel != true) return
            if (/^\.\s*dl\s+https/i.test(message.content)) return
            if (message.channel.parentId === "813564411628355625") return; //administracion
            if (message.channel.parentId === "1169624626188521563") return; // registro principales
            if (message.channel.parentId === "1120080747668197436") return; // registro secundarios
            if (message.channel.parentId === "874730574089187359") return; //extralaborales
            if (message.channel.id === "1005354020333948988") return;       //basados
            if (message.author.id == "1095572785482444860") return; // hiraku
            if (Object.values(config.ignoredCategories).includes(message.channel.parentId as string))
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
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod

async function action(message: Message, client: Client, args: string) {
    try {
        if (message)
            await message.delete();
        const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        if (!client.user) return
        const botAvatar = client.user.displayAvatarURL();
        const botsChannel = client.channels.cache.find(
            (channel) => channel.id === config.backupChannel
        );
        const messageFormated = args.replace(/`/g, "");

        //envia el textWall a bots
        const exampleEmbed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR as ColorResolvable)
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
        if (message.channel instanceof TextChannel != true) return
        message.channel.sendTyping()
        await message.channel
            .send(`<@${message.author.id}>` + aviso)
            .then(async (msg) => {
                setTimeout(async () => {
                    await msg.delete();
                }, 10000);
            });

        // Hace un backup en el dm si esta abierto o en un canal del servidor
        if (!message.member) return
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
                        if (!botsChannel) return
                        if (botsChannel instanceof TextChannel != true || botsChannel instanceof DMChannel) return
                        botsChannel.sendTyping()
                        botsChannel.send({
                            content: `<@${message.author.id}> ${aviso}`,
                            embeds: [exampleEmbed],
                        });
                    } else client.errorLogger(err, client, "error", process.cwd() + " ");
                });
            })
            .then(() => {
                client.automodLogger(
                    message,
                    client,
                    "Un text wall fue borrado",
                    `<@${message.author.id}> pasó un texto excesivo`
                );
            });

        //logea la situacion
    } catch (err: any) {
        if (err.code == 10008) return
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}