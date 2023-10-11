const { SlashCommandBuilder } = require("discord.js");
const { OWNERS_ID } = require("../../config.json");
const errorLogger = require("../../functions/loggers/errorLogger");
module.exports = {
    name: "replace",
    category: "utility",
    description: "Reemplaza caracteres de un mensaje",
    slashCommand: false,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("replace")
        .setDescription("Reemplaza caracteres de un mensaje"),

    async run(message) {
        try {
            replace(message);
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};

async function replace(message) {
    if (OWNERS_ID.includes(message.author.id)) {
        if (message.reference) {
            await message.channel.messages
                .fetch(message.reference.messageId)
                .then((msg) => {
                    if (msg.content) {
                        const args = message.content;
                        const arg1 = args
                            .split(/ +/)
                            .slice(1)
                            .join(" ")
                            .match(/(.*)-to/)[0]
                            .replace(/\s*-to/, "");
                        const arg2 = args
                            .split(/ +/)
                            .slice(1)
                            .join(" ")
                            .match(/-to(.*)/)[0]
                            .replace(/-to\s*/, "");
                        const regex = new RegExp(arg1, "gim");
                        const result = msg.content.replace(regex, arg2);
                        message.reply(result);
                    }
                });
        }
    }
}
