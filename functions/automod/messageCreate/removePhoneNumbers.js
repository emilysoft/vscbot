const vscLog = require("../../loggers/automodLogger");
const inmunidad = require("../../../settings/inmunidad.json");
const errorLogger = require("../../loggers/errorLogger");
const isNumberInMessage = require("./isNumberInMessage");
module.exports = async (message) => {
    if (message.channel.parentId === "813564411628355625") return; //administracion
    if (message.channel.parentId === "1120080747668197436") return; // registro
    if (message.channel.parentId === "874730574089187359") return; //extralaborales


    if (isNumberInMessage(message)) {
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
            if(message.author.bot) return
            const muted = message.guild.roles.cache.find(
                (role) => role.name === "Muted"
            );
            if (muted) {
                message.member.roles.add(muted, "Enviar un numero de teléfono");
            } else {
                message.member.timeout({
                    reason: "Pasar un numero de telefono", time: 6 * 24 * 60 * 60 * 1000
                });
            }

            vscLog(
                message,
                message.client,
                "Número de teléfono",
                "ha sido muteado por enviar un posible numero de teléfono"
            );
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    }
};
