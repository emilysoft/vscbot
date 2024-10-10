const errorLogger = require("../../loggers/errorLogger");
const vscLog = require("../../loggers/automodLogger");
const {ignoredCategories } = require("../../../config.json")
const regexs = {
    everyone: /@everyone/gim,
    cp2: /cepe/igm,
    cp3: /cepecito/gim,
    cp4: /child porn/gim,
    cp5: /cpecito/gim,
    cp6: /cpero/gim,
    cp7: /cperos/gim,
    cp8: /cpesito/gim,
    cp9: /cpsito/gim,
    cp10: /cunny/gim,
    cp11: /groomer/gim,
    cp12: /grooming/gim,
    cp13: /matate/gim,
    cp14: /matese/gim,
    cp15: /pnrtscr/gim,
    cp16: /porno infantil/gim,
    cp17: /pornografia infantil/gim,
    cp18: /reideen/gim,
    cp19: /sepe/gim,
    cp20: /suisuidate/gim,
    cp21: /vscpero/gim,
    cp22: /vscperos/gim,
    cp23: /zepe/gim,
    cp24: /p(3|e)dr(a|@)st((a|@)|(i|!|¡||))a?/gim,
    cp25: /(relacion(es)?|sexo|cojer|follar|tirar)scons(una?s)?((des1[0-7])|menor(es)?|niñ(a|o)s?)/gim,
    cp26: /\b(c|Ç|с|ƈ|ċ|ż|ʐ|ʂ|z)+e?([\s\._\-]+)?p+e?\b/gim,
    cp27: /p+(\n+|s+)?(e|3)+(\n+|s+)?d+(\n+|s+)?(o|о|ο|օ|ȯ|ọ|ỏ|ơ|ó|ò|ö|0|°)+(\n+|s+)?(f+(\n+|s+)?(1|i|!|¡||ï|í)+(\n+|s+)?l+(\n+|s+)?(o|0|°)+|b+(3|e)+(4a|@)r)/gim,
    cp28: /(r+(s+|\n+)?(4|a|@)+(s+|\n+)?(i|1|!|¡||)+(s+|\n+)?d+(s+|\n+)?|(ո|n|И)+(s+|\n+)?(u|υ|ս|ü|ú|ù)+(s+|\n+)?k+(s+|\n+)?(3|e))/gim,
    cp29: /\bg+[\s\n\.\-_]*r+[\s\n\.\-_]*[uoоοօȯọỏơóòö0°\s\n\.\-_]+[m\s\n\.\-_]*(e+n|e+a(ban|ste|s|nos|ras*|ramos|d*o|rias|ba)|e+a*n*d*o|[3ea\n\s\.\-_]+r+[\s\n\.\-_]*s*|[\s\n\.\-_]*i+[\s\n\.\-_]*n+[\s\n\.\-_]*g+)\b/gim,
    cp30: /(\b(g|v)[oоοօȯọỏơóòö0°]+[\s\n\-_]*r[\s\n\-_]*(3|e)\b|\bk[\s\n\-_]*y[\s\n\-_]*s\b)0/gim,
    cp31: /p+[\n\s\-_\.]*[3e][\n\s\-_\.]*d+[\n\s\-_\.]*[oоοօuȯọỏơóòö0°\s\n]+[\n\s\-_\.]*(f+[\n\s\-_\.]*[1i!¡|ïíl\s]+|p+[\n\s\-_\.]*h+[\n\s\-_\.]*[1i!¡|ïíl\s]+)/gim,
    cp32: /p+[\n\s\-_\.]*[3e][\n\s\-_\.]*d+[\n\s\-_\.]*r+[\n\s\-_\.]*[4a@\n\s]+[\n\s\-_\.]*s+[\n\s\-_\.]*t+[\n\s\-_\.]*([4a@\n\s]+|[1i!¡|ïíl\s\n]+[\n\s\-_\.]*[4a@\n\s]+|y)/gim,
    loli: /\b(l)[\n\s\-_\.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s\-_\.]*(l)+[\n\s\-_\.]*[i!¡|ïí1](s|z)?(((c|k)[\n\s\-_\.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s\-_\.]*n)|\b)/gim,
    raid: /\b[🇷r]+[\n\s\.\-_]*[🅰️α4a@]+[\n\s\.\-_]*[iℹ️I1!¡|]+[\n\s\.\-_]*(d|🇩)/gim,
    godkermit:
        /g[\n\s\-_\.]*o[\n\s\-_\.]*d[\n\s\-_\.]*(k|q)[\n\s\-_\.]*[uυüúù\s\n\-_\.]*[eеẹėéè3\s\n\.\-_]+(r+|l+)[\n\s\.\-_]*m+[\n\s\.\-_]*[1i!¡\|ïíy]+t*\b/gim,
    emptyText: "឵",
};

module.exports = async (message) => {
    try {
        if (
            message.author.id == "302249242469335060" ||
            message.author.id == "690796358579257424"
        )
            return;
        if (message.channel.name.startsWith("ticket")) return; //evitar canales de tickets

        if(message.author.id == "268478587651358721") return; //MonitoRSS
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
