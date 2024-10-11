import automodLogger from "../loggers/automodLogger.js"
import errorLogger from "../loggers/errorLogger.js"
import { bio, sambox, godkermit}  from "../../regexs/regexs"
export default (member) => {
    const user = member.user
    const client = member.client
    const regex = [bio, sambox, godkermit]
    try {

        for (let ex of regex) {
            if (user.username.match(regex[ex]) != null) {
                member.ban({
                    reason: "Usuario ya baneado o apodo con invite",
                });
                automodLogger(
                    message,
                    client,
                    "Usuario baneado",
                    "Usuario ya baneado o apodo con invite"
                );
                break;
            }
        }
    } catch (err) {
        errorLogger(err, client, "error", import.meta.url);
    }
};
