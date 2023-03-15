const vscLog = require("../loggers/logger");
const inmunidad = require("../../settings/inmunidad.json");
module.exports = async (message) => {
    const regex =
        /([^\.\w\d\-_:\?\/]+|^)(5([\-\.\s\n_]+)?8)?0?(4([\-\.\s\n_]+)?1([\-\.\s\n_]+)?4([\-\.\s\n_]+)?|4([\-\.\s\n_]+)?2([\-\.\s\n_]+)?4([\-\.\s\n_]+)?|4([\-\.\s\n_]+)?1([\-\.\s\n_]+)?2([\-\.\s\n_]+)?|4([\-\.\s\n_]+)?2([\-\.\s\n_]+)?6([\-\.\s\n_]+)?|4([\-\.\s\n_]+)?1([\-\.\s\n_]+)?6([\-\.\s\n_]+)?|2([\-\.\s\n_]+)?1([\-\.\s\n_]+)?2([\-\.\s\n_]+)?)(\d([\-\.\s\n_]+)?){7}([^\.\w\d\-_:\/]+|$)/gm;
    //    if(message.channel.id != "1024260771326197781") return
    const regex2 = /b([\s\.\-_]+)?r([\s\.\-_]+)?(a|@|4)([\s\.\-_]+)?y([\s\.\-_]+)?(a|@|4)([\s\.\-_]+)?(ո|n|И)([\s\.\-_]+)?r([\s\.\-_]+)?(o|о|ο|օ|ȯ|ọ|ỏ|ơ|ó|ò|ö|0|°)([\s\.\-_]+)?m([\s\.\-_]+)?(3|e)([\s\.\-_]+)?r([\s\.\-_]+)?(o|о|ο|օ|ȯ|ọ|ỏ|ơ|ó|ò|ö|0|°)/gim
    if (message.content.match(regex) != null) {
        try {
            for (let inmune in inmunidad) {
                if (
                    message.member.roles.cache.some(
                        (role) => role.id === inmunidad[inmune]
                    )
                )
                    return;
            }
            message.delete();
            const muted = message.guild.roles.cache.find(
                (role) => role.name === "Muted"
            );
            if (muted)
                message.member.roles.add(muted, "Enviar un numero de teléfono");
            vscLog(
                message,
                message.client,
                "Número de teléfono",
                "ha sido muteado por enviar un posible numero de teléfono"
            );
        } catch (e) {
            console.error(e);
        }
    }
};
