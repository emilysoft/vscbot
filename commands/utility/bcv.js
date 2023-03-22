const getBCVdata = require("../../functions/getBCVdata");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: "bcv",
    async execute(message) {
        try {
            message.channel.send("Cargando...").then(async (msg) => {
                const client = message.client;
                const embed = await getBCVdata(client);
                msg.edit({ content: "", embeds: [embed] });
            });
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};