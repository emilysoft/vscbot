import { EmbedBuilder, AttachmentBuilder, Message, TextChannel, ColorResolvable } from "discord.js"
import config from "../../config.json" with {type:"json"}
import path from "path"
import { writeFile, unlink } from "fs/promises"
import Client from "../../interfaces/ICustomClient.js"
const module = async (message:Message, client:Client) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id == "1024260771326197781") return;
        if (message.attachments.size == 0) return;
        if(!message.member || !message.guild) return
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
                            if(botsChannel instanceof TextChannel != true) return
                            await botsChannel
                                .send({
                                    embeds: embed,
                                    files: [file],
                                })
                                .then(() => {
                                    unlink(
                                        path.join(
                                            process.cwd(),`dist/functions/automod/messageCreate/temp/${fileName}.png`
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
                        .setColor(config.EMBED_COLOR as ColorResolvable)
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
                            if(botsChannel instanceof TextChannel != true) return
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
                                            process.cwd(), `dist/functions/automod/messagecreate/temp/${fileName}.mp4`
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
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
};

function embedBuilder(imageURL: string, avatarPhoto: string, botAvatar: string, message:Message) {
    return new EmbedBuilder()
        .setColor(config.EMBED_COLOR as ColorResolvable)
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

async function downloadAttach(url:string, format:string, name:string) {

    let outPath = path.join(process.cwd(), `dist/functions/automod/messagecreate/temp/${name}.${format}`);
    await fetch(url)
        .then((x) => x.arrayBuffer())
        .then((x) => writeFile(outPath, Buffer.from(x)));
}

export default module
