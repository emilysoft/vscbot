const automodLogger = require("../loggers/automodLogger");
const errorLogger = require("../loggers/errorLogger");
const { bio, sambox, godkermit}  = require("../../regexs/regexs.js")
module.exports = (member) => {
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
        errorLogger(err, client, "error");
    }
};