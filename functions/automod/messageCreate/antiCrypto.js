import errorLogger from "../../loggers/errorLogger.js"
import logger from "../../loggers/automodLogger.js"
import vscLog from "../../loggers/automodLogger.js"
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
const regex = /(hello|hi|i'll|i will).*(help|teach).*(earn|profit|crypto).*(\d{1,3}k\$?|doubts|the first|\d{1,3} hours).*(crypto|commission|profit)/gim;
const module = (message, client) => {
    try {
        if (message.content.match(regex) != null) {
            if (message.member.roles.cache.some((role) => role.id === lvl10))
                return;
            if (message.member.roles.cache.some((role) => role.id === lvl5))
                return;
            message.delete();
            message.member.ban({ reason: "scammer bot" });
            logger(
                message,
                client,
                "Scammer bot",
                "ha sido baneado por enviar scam"
            );
        }
    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
};
export default module
