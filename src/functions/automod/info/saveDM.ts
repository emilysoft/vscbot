import { Message } from "discord.js"
import Client from "./../../../interfaces/ICustomClient.js"
import Iautomod from "./../../../interfaces/Iautomod.js"
const regex =
    /(puedo|deja)\s+(pasar|enviar|mandar)\s+(unas\s+|una\s+)?(imagenes|capturas?|imagen|foto|fotos|videos|m(e|o)m(o|e)s)/gim;
export default {
    name: "savdDM",
    vscOnly: false,
    ignoreBots: true,
    allowEdited: true,
    execute: async function(message: Message, client: Client) {
        try {
            if (!message.content.startsWith(".save")) return;

            else if (message.reference) {
                if (!message.reference.messageId) return
                await message.channel.messages
                    .fetch(message.reference.messageId)
                    .then((msg) => {
                        if ((msg.content == "")) {
                            message.reply({
                                content: "Messages with no text are not supported yet.",
                                allowedMentions: {
                                    repliedUser: false,
                                },
                            });
                            return
                        }
                        message.author.send(`${msg.content}`).then(() => {
                            message.react("☑");
                        })
                            .catch(e => {
                                message.author.send({ content: "Please open your DM o invite me in a server with allowed DM permissions." })
                            })
                    })
                    .catch(console.error);
            }
        } catch (err) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod
