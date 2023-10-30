const errorLogger = require("../../loggers/errorLogger");
const vscLog = require("../../loggers/automodLogger");
const {ignoredCategories } = require("../../../config.json")
const regexs = {
    raid: /\br+[\n\s\.\-_]*[4а@aäąàáạ]+[\n\s\.\-_]*[iіI1!¡|ïí]+[\n\s\.\-_]*(d|ɗ)/gim,
    loli: /\b(l)[\n\s\-_\.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s\-_\.]*(l)+[\n\s\-_\.]*[i!¡|ïí1](s|z)?(((c|k)[\n\s\-_\.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s\-_\.]*n)|\b)/gim,
    godkermit:
        /(q(\n+)?(u|υ|ü|ú|ù)?|k|q)(\n+)?[eеẹėéè3]+(\n+)?(r|l|m|n)(\n+)?m(\n+)?((1|i|!|¡|\||ï|í)|y)(\n+)?/gim,
};

module.exports = async (message) => {
    try {
        if (
            message.author.id == "302249242469335060" ||
            message.author.id == "690796358579257424"
        )
            return;
        if (message.channel.name.startsWith("ticket")) return; //evitar canales de tickets

        


        if (message.channel.parentId === "813564411628355625") return; //administracion
        if (message.channel.parentId === "874730574089187359") return; //extralaborales
        if (message.channel.parentId === "1120080747668197436") return; //extralaborales

        for (let regex in regexs) {
            if (message.content.match(regexs[regex]) != null) {
                await message.delete();
                await message.member.timeout(60 * 1000, "Palabra bloqueada");
                //logea la situacion
                vscLog(
                    message,
                    message.client,
                    "Palabra bloqueada",
                    `<@${message.author.id}>: ${message.content}`
                );
                break;
            }
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
