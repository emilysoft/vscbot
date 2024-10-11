import errorLogger from "../../loggers/errorLogger.js"
import { EmbedBuilder, AttachmentBuilder } from "discord.js"
import config from "../../../config.json" with {type:"json"}
import path from "path"
import { writeFile, unlink } from "fs/promises"
const module = async (message) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id == "1024260771326197781") return;
        if (message.attachments.size == 0) return;
        const avatarPhoto = message.member.displayAvatarURL();
        const botAvatar = message.client.user.displayAvatarURL();
        const botsChannel = message.guild.channels.cache.find(
            (channel) => channel.id === "1277121114786496572"
        );
        const fileName = message.id;
        const { attachments } = message;

        attachments.forEach(async (attachment) => {
            switch (attachment.contentType) {
                case "image/jpeg":
                case "image/png":
                    let embed = [
                        embedBuilder(
                            fileName + ".png",
                            avatarPhoto,
                            botAvatar,
                            message
                        ),
                    ];
                    let file = new AttachmentBuilder(
                        `functions/automod/messageCreate/temp/${
                            fileName + ".png"
                        }`
                    );
                    await downloadAttach(attachment.url, "png", fileName).then(
                        async () => {
                            await botsChannel
                                .send({
                                    embeds: embed,
                                    files: [file],
                                })
                                .then(() => {
                                    unlink(
                                        path.join(
                                            __dirname + `/temp/${fileName}.png`
                                        )
                                    );
                                });
                        }
                    );
                    break;
                case "video/mp4":
                case "video/mov":
                case "video/webm":
                    const embed2 = new EmbedBuilder()
                        .setColor(config.EMBED_COLOR)
                        .setTitle(message.author.username)
                        .setDescription(
                            `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>**`
                        )
                        .setAuthor({
                            name: message.author.username,
                            iconURL: avatarPhoto,
                        })
                        .setTimestamp()
                        .setFooter({
                            text: `author: ${message.author.id} | Message ID: ${message.id}`,
                            iconURL: botAvatar,
                        });

                    await downloadAttach(attachment.url, "mp4", fileName).then(
                        async () => {
                            await botsChannel
                                .send({
                                    embeds: [embed2],
                                    files: [
                                        `functions/automod/messageCreate/temp/${fileName}.mp4`,
                                    ],
                                })
                                .then(() => {
                                    unlink(
                                        path.join(
                                            __dirname + `/temp/${fileName}.mp4`
                                        )
                                    );
                                });
                        }
                    );

                    break;
                default:
                    return;
            }
        });
    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
};

function embedBuilder(imageURL, avatarPhoto, botAvatar, message) {
    return new EmbedBuilder()
        .setColor(config.EMBED_COLOR)
        .setTitle(message.author.username)
        .setDescription(
            `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>**`
        )
        .setAuthor({
            name: message.author.username,
            iconURL: avatarPhoto,
        })
        .setImage("attachment://" + imageURL)
        .setTimestamp()
        .setFooter({
            text: `author: ${message.author.id} | Message ID: ${message.id}`,
            iconURL: botAvatar,
        });
}

async function downloadAttach(url, format, name) {
    let outPath = path.join(__dirname + "/temp/" + `${name}.${format}`);
    await fetch(url)
        .then((x) => x.arrayBuffer())
        .then((x) => writeFile(outPath, Buffer.from(x)));
}

export default module
