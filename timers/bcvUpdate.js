const getBCVdata = require("../functions/getBCVdata");
const errorLogger = require("../functions/loggers/errorLogger");
const targetChannel = "813562627481010196";
module.exports = {
    async updateMorning(message) {
        try {
            if (message.author.id == "282286160494067712") {
                const client = message.client;
                const embed = await getBCVdata(client);
                message.reply({ embeds: [embed] });
            }
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
    // pon las variables en ingles
    async updateAfternoon(now, client) {
        try {
            const day = now.getDay();
            const hour = now.getHours();
            const minutes = now.getMinutes();
            if (day == 0 || day == 6) return;
            if (hour == 17 && minutes == 0) {
                const channel = client.channels.cache.find(
                    (c) => c.id === targetChannel
                );
                const embed = await getBCVdata(client);
                channel.send({ embeds: [embed] });
            }
        } catch (err) {
            errorLogger(err, client, "error");
        }
    },
};
