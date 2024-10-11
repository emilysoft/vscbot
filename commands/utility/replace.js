import { SlashCommandBuilder } from "discord.js"
import config from "../../config.json" with {type:"json"}
import errorLogger from "../../functions/loggers/errorLogger.js"
const module = {
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
    if (config.OWNERS_ID.includes(message.author.id)) {
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

export default module
