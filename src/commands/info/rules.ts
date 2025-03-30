import { Message, ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ColorResolvable } from "discord.js"
import config from "../../config.json" with {type: "json"}
import ICommand from "../../interfaces/command.js"
import client from "../../index-vsc.js"
import rule from "../../functions/automod/info/rules.json" with {type: "json"}
const UNKHOWN_MESSAGE = 10008;
const module: ICommand = {
    name: "rules",
    description: "Muestra las reglas",
    slashCommand: false,
    messageCommand: true,
    data: new SlashCommandBuilder()
        .setName("rules")
        .setDescription("Muestra las reglas"),
    async execute(interaction: ChatInputCommandInteraction) {
    },
    async run(message: Message) {
        rules(message);
    },
};

function rules(message: Message) {
    try {
        const match = message.content.match(/^>r\s*([1-5])$/i);
        const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        if (match) {
            const ruleNumber = match[1];
            const msg = rule.find((r) => r.id === ruleNumber);
            const botAvatar = message.client.user.displayAvatarURL();
            if (!message.client.user) return
            if (msg) {
                const embed = new EmbedBuilder()
                    .setTitle(`Regla ${msg.title}`)
                    .setAuthor({ name: message.client.user.username, iconURL: botAvatar })
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
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ")
        console.error(err)
    }
}

export default module