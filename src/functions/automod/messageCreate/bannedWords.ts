import errorLogger from "../../loggers/errorLogger.js";
import vscLog from "../../loggers/automodLogger.js";
import { Message, TextChannel } from "discord.js";
import Client from "../../../classes/ICustomClient.js"
type Regexs = {
    raid: RegExp;
    loli: RegExp;
    godkermit: RegExp;
};
const regexs: Regexs = {
    raid: /\br+[\n\s\.\-_]*[4а@aäąàáạ]+[\n\s\.\-_]*[iіI1!¡|ïí]+[\n\s\.\-_]*(d|ɗ)/gim,
    loli: /\b(l)[\n\s\-_\.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s\-_\.]*(l)+[\n\s\-_\.]*[i!¡|ïí1](s|z)?(((c|k)[\n\s\-_\.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s\-_\.]*n)|\b)/gim,
    godkermit:
        /(q(\n+)?(u|υ|ü|ú|ù)?|k|q)(\n+)?[eеẹėéè3]+(\n+)?(r|l|m|n)(\n+)?m(\n+)?((1|i|!|¡|\||ï|í)|y)(\n+)?/gim,
};

const module = async (message: Message, client:Client) => {
    try {
        //if (
        //    message.author.id == "302249242469335060" ||
        //    message.author.id == "690796358579257424"
        //)
        const { content, channel, author } = message;
        if (!message.member) return;
        const member = await message.member.fetch();
        if (
            member.roles.cache.some((role) => role.id === "1120750038440738868")
        )
            return;
        if (author.bot) return; //evita bots
        if(channel instanceof TextChannel != true) return
        if (channel.name.startsWith("ticket")) return; //evitar canales de tickets
        if (channel.id == "821067797157118013") return; //mudae
        if (channel.id == "1005354020333948988") return; //basados
        if (author.id == "268478587651358721") return; //MonitoRSS
        if (channel.parentId === "813564411628355625") return; //administracion
        if (channel.parentId === "874730574089187359") return; //extralaborales
        if (channel.parentId === "1120080747668197436") return; //registro secundarios
        if (channel.parentId === "853387980335874078") return; //debates

        for (let regex in regexs) {
            if (content.match(regexs[regex as keyof Regexs]) != null) {
                await message.delete();
                await member.timeout(60 * 1000, "Palabra bloqueada");
                //logea la situacion
                vscLog(
                    message,
                    client,
                    "Palabra bloqueada",
                    `<@${message.author.id}>: ${message.content}`
                );
                break;
            }
        }
    } catch (err:any) {
        if(err.code == 10008) return
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module;
