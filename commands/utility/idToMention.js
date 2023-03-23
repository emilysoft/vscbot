const getIds = require("../../functions/getIds");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: 'getmentions',
    description: 'pasa ids a menciones',
    async execute(message) {
        try {
            const modId = "813568302294761486";
            if (!message.member.roles.cache.some((role) => role.id === modId))
                return;
            const ids = getIds(message.content);
            if (ids.length == 0) {
                message.channel.send(
                    `<@${message.author.id}> Por favor especifique una (ID o mención).`
                );
                return
            }
            const respond = [];
            for (id of ids) {
                respond.push(`<@${id}>`);
            }
            message.channel.send(`${respond.join("\n")}`);
        } catch (err) {
            message.channel.send("Hubo un error.")
            errorLogger(err, message.client, "error");
        }
    },
};
