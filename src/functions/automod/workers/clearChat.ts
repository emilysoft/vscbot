import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";

export default {
    name: "clearChat",
    ignoreBots: false,
    vscOnly: false,
    allowEdited: false,
    execute: function (message: Message, client: Client) {
        try {
            if (!message.guild) return
            const { channel } = message
            if (!(channel instanceof TextChannel)) return
            const channelName = channel.name
            if (message.guild.id == "813538324320092161" || channelName.includes("general")) {
                //general
                clearNSB(message, "813538324320092164");
                //general 2
                clearNSB(message, "1345943077470076979");
                clearNSB(message, "853387980335874078");

                return
            }
            //neetoons
            if (message.guild.id == "811827256489541643") {
                clearNSB(message, "871386967726772234");
            }
        } catch (err: any) {
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod

async function clearNSB(message: Message, channelId: string) {
    //general
    if (message.channel.id != channelId) return;
    const { channel } = message;
    if (channel instanceof TextChannel != true) return;

    const messagesToDelete: string[] = [];
    //nekotina o nsb
    if (
        message.author.id == "439205512425504771" ||
        message.author.id == "429457053791158281"
    ) {
        if (message.embeds.length == 0) return;
        if (message.reference?.messageId) {
            const repliedMsg = await message.channel.messages.fetch(
                message.reference.messageId
            );

            if (/\.\s*(caption|meme|\bi\b)/i.test(repliedMsg.content))
                return;
            messagesToDelete.push(repliedMsg.id);
        }
        messagesToDelete.push(message.id);
    }
    if (messagesToDelete.length == 0) return;

    setTimeout(async () => {
        await channel.bulkDelete(messagesToDelete);
    }, 3 * 60 * 1000);
}

export async function clearBots(msg: Message) {
    //general
    const { channel } = msg;
    if (channel instanceof TextChannel != true) return;
    const messages = await channel.messages.fetch();
    if (!messages) return;
    const messagesToDelete = [];
    for (const [id, message] of messages) {
        //nekotina o nsb
        if (
            message.author.id == "439205512425504771" ||
            message.author.id == "429457053791158281"
        ) {
            messagesToDelete.push(message.id);
        }
    }

    await channel.bulkDelete(messagesToDelete);
}
export async function clearGulag(client: Client) {
    //general
    const dontdeletemsgid = "1182114475906699305";
    const gulagId = "1058586276854517873";
    const guild = client.guilds.cache.get("813538324320092161");
    if (!guild) return;
    const channel = await guild.channels.fetch(gulagId);

    if (channel instanceof TextChannel != true) return;
    let messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    if (!lastMessage) return
    const haceTresDias = Date.now() - (2 * 24 * 60 * 60 * 1000)
    if (lastMessage.createdTimestamp > haceTresDias) return;
    messages = await channel.messages.fetch();
    if (!messages) return;
    const messagesToDelete = messages
        .filter((msg) => msg.id != dontdeletemsgid)
        .map((msg) => msg.id);
    console.log(messagesToDelete);
    await channel.bulkDelete(messagesToDelete);
}

//async function clearComandos(guild: Guild) {
//    //comandos
//    const channel = await guild.channels.fetch("1112164583344443433");
//    if (channel instanceof TextChannel != true) return;
//    const messages = await channel.messages.fetch();
//    if (!messages) return;
//    const messagesToDelete: Array<string> = [];
//    messages.forEach(async (message) => {
//        //nekotina o nsb
//        if (message.author.id != "429457053791158281") return;
//        if (message.reference?.messageId) {
//            const repliedMsg = await message.channel.messages.fetch(
//                message.reference.messageId
//            );
//            console.log("debe borrar 1");
//            messagesToDelete.push(repliedMsg.id);
//        }
//        console.log("debe borrar 2");
//        messagesToDelete.push(message.id);
//    });
//    await channel.bulkDelete(messagesToDelete);
//}
//
