const errorLogger = require("../../loggers/errorLogger");

vscLog = require("../../loggers/automodLogger");
module.exports = (message, client, ignoredChannels, backupChannel) => {
    try {
        const chiste2 = `Borré tu mensaje porque es muy largo, usa <#853387980335874078>`;
        const botsChannel = client.channels.cache.find(
            (channel) => channel.id === backupChannel
        );
        const excepciones = {
            outOfContextRoleId: "813549579097735229",
            moderacionRoleId: "813568302294761486",
            SilenciadoRoleId: "813572971338792962",
            mutedRoleId: "936077832747118652",
        };

        if (message.channel.isThread()) return;
        if (message.author.bot == true && message.author.id != "439205512425504771")
            return;
        if (message.author.id == "302249242469335060") return;
        for (let key in excepciones) {
            if (
                message.member.roles.cache.some(
                    (role) => role.id === excepciones[key]
                )
            )
                return;
        }
        if (Object.values(ignoredChannels).includes(message.channelId)) return;
        if (message.channel.name.startsWith("ticket")) return;
        //Get text
        const limiteCaracteres = 500;
        let args = message.content;
        //no more than 280 characters
        if (args.length > limiteCaracteres) {
            //borra el walltext
            console.warn("walltexts de: " + args.length + " caracteres");
            message.delete()

            //envia el walltext a bots
            botsChannel.send(`<@${message.author.id}> ${message.content}`)
            message.channel
                .send(`<@${message.author.id}>` + chiste2)
                .then((msg) => {
                    setTimeout(() => {
                        msg.delete()
                    }, 10000);
                });
            vscLog(
                message,
                client,
                "Un walltext fue borrado",
                `<@${message.author.id}> pasó un texto demasiado largo`
            );
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
