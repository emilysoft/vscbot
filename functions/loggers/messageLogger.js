const errorLogger = require("./errorLogger");
const fs = require("fs");
const path = require("path");
module.exports = async (message, type) => {
    try {
        const categories = [
            "813538324320092162",
            "836011738662961162",
            "813564125380214785",
            "1122175563688317058",
        ];
        if (message.channel.id == "1160325903461666927") return;
        if (message.channel.id == "1024260771326197781") return;
        if (message.channel.id == "813562363243921459") return;
        let typeLog;
        if (type == "create") typeLog = "MESSAGE CREATED";
        else if (type == "delete") typeLog = "MESSAGE DELETED";
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
        const channelName = message.channel.name;
        const userName = message.author.username;
        let messageContent = "";
        let images = [];

        if (message.content == "") {
            if (message.attachments.size > 0) {
                messageContent = "imagen(es)";
                //                message.attachments.forEach((image) =>
                //                    images.push(image.url)
                //                );
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
            path.join(__dirname, `../../logs/out/${year}-${month}-${date}.log`),
            `${log1}\n`,
            { flag: "a+" },
            (err) => {
                if (err) errorLogger(err, message.client, "error");
            }
        );
        if (categories.includes(message.channel.parentId)) {
            const log = `[${typeLog}] __[#${channelName.replace(/[^a-zA-Z0-9\-]+/, "")}](<https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}>)__ **${userName}**: ${messageContent} ||userID:[${authorID}]||`;
            const { guild } = message;
            guild.channels.cache
                .get("1160325903461666927")
                .send(log.replace(/<@/gim, "<!@"));
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
