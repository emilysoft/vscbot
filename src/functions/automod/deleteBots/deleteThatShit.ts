import { Message, TextChannel} from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";

export default {
    name:"deleteThatShit",
    vscOnly: true,
    ignoreBots: false,
    execute: async function(message:Message,client:Client) {
        const { content } = message;
        try {
            const {channel} = message;
            if (channel instanceof TextChannel != true) return;
            if (channel.id == "813538324320092164") {
                //general
                if (/^\.\s*dl\s+https/i.test(content)) {
                    return await message.delete();
                }
                if (message.content.startsWith("=") && message.author.bot != true)
                    await message.delete(); // borra el =fm
                if (message.author.id == "356268235697553409")
                    return setTimeout(async () => await message.delete(), 3000); // borra el bot fmbot
            }

            if (message.author.id == "439205512425504771") {
                //nsb
                if (/Unknown Tag/gim.test(message.content)) {
                    setTimeout(async () => {
                        const messagesToDelete:string[]= [];
                        if (message.reference?.messageId) {
                            const repliedMsg = await channel.messages.fetch(
                                message.reference.messageId
                            );
                            if (repliedMsg) {
                                messagesToDelete.push(repliedMsg.id)
                            }
                        }
                            messagesToDelete.push(message.id)
                            if(messagesToDelete.length == 0) return
                            await channel.bulkDelete(messagesToDelete)
                    }, 5000);
                }
                if (message.embeds.length > 0) {
                    // embeds
                    let args = message.embeds[0].title;
                    if (args) {
                        if (args.match(/Command Error/gim) != null) {
                            setTimeout(async () => {
                                if (message) await message.delete();
                            }, 5000);
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.code == 10008) return;
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod