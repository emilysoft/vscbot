import { Message, ColorResolvable, EmbedBuilder } from "discord.js"
import Client from "./../../../interfaces/ICustomClient.js"
import Iautomod from "./../../../interfaces/Iautomod.js"
import config from "../../../config.json" with {type:"json"}
import rule from "./rules.json" with {type:"json"}
const UNKHOWN_MESSAGE = 10008;
export default {
    name:"rules",
    vscOnly: false,
    ignoreBots: true,
    execute: function(message:Message,client:Client) {
        try {
            const match = message.content.match(/^>r\s*([1-5])$/i);
            const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
            if (match) {
                const ruleNumber = match[1];
                const msg = rule.find((r) => r.id === ruleNumber);
                const botAvatar = message.client.user.displayAvatarURL();
                if(!client.user) return
                if (msg) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Regla ${msg.title}`)
                        .setAuthor({ name: client.user.username, iconURL: botAvatar })
                        .setDescription(msg.rule)
                        .setColor(config.EMBED_COLOR as ColorResolvable)
                        .setFooter({
                            text: message.author.username,
                            iconURL: avatarPhoto,
                        })
                        .setImage(
                            "https://cdn.discordapp.com/attachments/988431659059781632/1024488333402968084/line-neon.gif"
                        );
                    let messageResponse = {
                        embeds: [embed],
                    };
                    if (message.reference) {
                        message.channel.messages

                            .fetch(message.reference.messageId as string)
                            .then((msg) => {
                                msg.reply(messageResponse);
                            })
                            .catch((e) =>
                                e.code == UNKHOWN_MESSAGE
                                    ? message.reply(messageResponse)
                                    : null
                            );
                    } else {
                        message.reply(messageResponse);
                    }
                }
            }
        } catch(err) {
            client.errorLogger(err, client, "error", process.cwd() + " ")
            console.error(err)
        }
    }
} as Iautomod 