import { Guild, EmbedBuilder, AttachmentBuilder, Message, TextChannel, ColorResolvable } from "discord.js"
import config from "../../config/config.json" with {type: "json"}
import Client from "../../interfaces/ICustomClient.js"
import { downloadFromURL, clearDownload } from "../lib/download.js"
import dotenv from "dotenv"
dotenv.config()
const MAIN_SERVER = process.env.MAIN_SERVER


const module = async (message: Message, client: Client) => {
    try {
        if (message.author.bot) return;
        if (message.channel.id == "1024260771326197781") return;
        if (message.attachments.size == 0) return;
        if (!message.member || !message.guild) return
        const { guild } = message
        if (!(guild instanceof Guild)) return
        if (guild.id != MAIN_SERVER) return

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
                    const embed = [
                        embedBuilder(
                            fileName + ".png",
                            avatarPhoto,
                            botAvatar,
                            message
                        ),
                    ];
                    await downloadFromURL(attachment.url, "png", fileName).then(
                        async (filePath) => {
                            if (!filePath) return
                            if (botsChannel instanceof TextChannel != true) return
                            await botsChannel
                                .send({
                                    embeds: embed,
                                    files: [new AttachmentBuilder(filePath)],
                                })
                                .then(() => {
                                    clearDownload(filePath)
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

                    await downloadFromURL(attachment.url, "mp4", fileName).then(
                        async (filePath) => {
                            if (!filePath) return
                            if (botsChannel instanceof TextChannel != true) return
                            await botsChannel
                                .send({
                                    embeds: [embed2],
                                    files: [filePath],
                                })
                                .then(() => {
                                    clearDownload(filePath)
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

function embedBuilder(imageURL: string, avatarPhoto: string, botAvatar: string, message: Message) {
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

export default module
