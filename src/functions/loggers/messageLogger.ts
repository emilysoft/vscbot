import { Message, TextChannel } from "discord.js";
import errorLogger from "./errorLogger.js"
import fs from "fs"
import path from "path"
import Client from "../../classes/ICustomClient.js"

const module = async (message:Message, type:string, client:Client) => {
    try {
        const categories = [
            "813538324320092162",
            "836011738662961162",
            "813564125380214785",
            "1122175563688317058",
        ];
        if (message.content.match(/^\$wa/) != null) return
        if (message.author.id == "432610292342587392") return //mudae
        if (message.channel.id == "1160325903461666927") return;
        if (message.channel.id == "1024260771326197781") return;
        if (message.channel.id == "813562363243921459") return;
        let typeLog;
        if (type == "create") typeLog = ":green_circle:";
        else if (type == "delete") typeLog = ":red_circle:";
        else if (type == "edit") typeLog = ":orange_circle:";
        else {
            throw new Error(
                "Error al especificar el tipo de evento de mensaje para el messageLogger"
            );
        }

        const now = new Date();
        const date = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const authorID = message.author.id;
        if(message.channel instanceof TextChannel != true) return
        const channelName = message.channel.name;
        const userName = message.author.username;
        let messageContent = "";
        let images = [];

        if (message.content == "") {
            if (message.attachments.size > 0) {
                messageContent = message.attachments.reduce((acc, curr) => acc + "\n" + curr.url, "");
            } else if (message.embeds.length > 0) {
                messageContent = "Embed";
            } else if (message.stickers.size > 0) {
                message.stickers.forEach((sticker) => {
                    messageContent = `sticker: ${sticker.name}`;
                });
            }
        } else {
            messageContent = message.content;
        }
        const log1 = `[${typeLog}][${date}/${month}/${year}][${hours}:${minutes}][${authorID}][${channelName}] ${userName}: ${messageContent}`;
        console.log(log1);

        fs.writeFile(
            path.join(process.cwd(), `/logs/out/${year}-${month}-${date}.log`),
            `${log1}\n`,
            { flag: "a+" },
            (err) => {
                if (err) errorLogger(err, client, "error", process.cwd() + " ");
            }
        );
        if (categories.includes(message.channel.parentId as string)) {
            if(!message.guild) return
            const log = `${typeLog} __[#${channelName.replace(/[^a-zA-Z0-9\-]+/, "")}](<https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}>)__ **${userName}**: ${messageContent} ||userID:[${authorID}]||`;
            const { guild } = message;
            if(!guild) return
            const channel = guild.channels.cache.get("1160325903461666927")
            if(!channel) return
            if(channel instanceof TextChannel) 
            channel.send(
                    log
                        .replace(/<@/gim, "<!@")
                        .replace(/@everyone/gim, "@!everyone")
                        .replace(/@here/gim, "@!here")
                );
        }
    } catch (err) {
        errorLogger(err, client, "error", process.cwd() + " ");
    }
};

export default module
