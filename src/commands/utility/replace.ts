import { Message, SlashCommandBuilder } from "discord.js"
import config from "../../config.json" with {type:"json"}
import ICommand from "../../interfaces/command.js"
import Client from "../../interfaces/ICustomClient.js"
const module: ICommand = {
    name: "replace",
    //category: "utility",
    description: "Reemplaza caracteres de un mensaje",
    slashCommand: false,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("replace")
        .setDescription("Reemplaza caracteres de un mensaje"),

    async run(message, client) {
        try {
            replace(message, client);
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
};

async function replace(message:Message, client:Client) {
    if (config.OWNERS_ID.includes(message.author.id)) {
        if (message.reference) {
            await message.channel.messages
                .fetch(message.reference.messageId as string)
                .then((msg) => {
                    if (msg.content) {
                        let match, arg1, arg2;
                        const args = message.content;
                        match = args
                            .split(/ +/)
                            .slice(1)
                            .join(" ")
                            .match(/(.*)-to/)
                        if(!match) return
                            arg1 =  match[0].replace(/\s*-to/, "");
                        match = args
                            .split(/ +/)
                            .slice(1)
                            .join(" ")
                            .match(/-to(.*)/)
                        if(!match) return
                            arg2 = match[0].replace(/-to\s*/, "");
                        if(!arg1 || !arg2) return  
                        const regex = new RegExp(arg1, "gim");
                        const result = msg.content.replace(regex, arg2);
                        message.reply(result);
                    }
                });
        }
    }
}

export default module
