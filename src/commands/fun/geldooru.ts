import { TextChannel, Message } from "discord.js";
import ICommand from "../../interfaces/command.js"
import Client from "../../interfaces/ICustomClient.js"
const UNKHOWN_MESSAGE = 10008;
const channelsAllowed = [
    "1024260771326197781",
    "813564359874838558",
    "1172695535468150814",
];
import { SlashCommandBuilder } from "discord.js";
const module: ICommand = {
    name: "gel",
    data: new SlashCommandBuilder()
        .setName("gel")
        .setDescription("Busca algo en geldooru"),
    cooldown: 5,
    allowEdited: false,
    description: "Busca algo en geldooru",
    messageCommand: true,
    slashCommand: false,
    async run(message: Message, client: Client) {
        geldooru(message, client);
    },
};

async function geldooru(message: Message, client: Client) {
    try {
        const { channel } = message;
        if (!channel) return;
        const channelId = channel.id;
        if (!channelsAllowed.includes(channelId)) return;
        let msg: string;
        if (channel instanceof TextChannel) {
            channel.sendTyping();
            if (channel.nsfw) {
                const query = message.content
                    .split(" ")
                    .slice(1)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .replace(/\s/g, "%20");
                if (!query) {
                    msg =
                        "especifique algo como ``genshin_impact 2girl sex`` _(si no especificas tags saldra algo sfw)_";
                    return message
                        .reply({
                            content: msg,
                            allowedMentions: {
                                repliedUser: false,
                            },
                        })
                        .catch((err) => {
                            err.code == UNKHOWN_MESSAGE
                                ? channel.send(msg)
                                : null;
                        });
                }

                const limit = 200,
                    tags = query,
                    token =
                        "&api_key=cffa0a9a093571bb17a5eeaa68114a5d64730c62d9e565227591d95f65710b98&user_id=1232751",
                    json = 1;

                const request = `https://gelbooru.com/index.php?page=dapi\&s=post&q=index&limit=${limit}&tags=${tags}&json=${json}&token=${token}`;
                await fetch(request)
                    .then(async (response) => {
                        const data = await response.json();
                        if (data.post) {
                            const image =
                                data.post[
                                    Math.floor(Math.random() * data.post.length)
                                ].file_url;
                            message
                                .reply({
                                    content: image,
                                    allowedMentions: {
                                        repliedUser: false,
                                    },
                                })
                                .catch((err) => {
                                    err.code == UNKHOWN_MESSAGE
                                        ? channel.send(image)
                                        : null;
                                });
                        } else {
                            msg =
                                "No se encontró lo especificado, intenta algo como genshin_impact futanari";
                            message
                                .reply({
                                    content: msg,
                                    allowedMentions: {
                                        repliedUser: false,
                                    },
                                })
                                .catch((err) => {
                                    err.code == UNKHOWN_MESSAGE
                                        ? channel.send(msg)
                                        : null;
                                });
                        }
                    })
                    .catch(() => {
                        msg = "hubo un error, intenta de nuevo";
                        message
                            .reply({
                                content: msg,
                                allowedMentions: {
                                    repliedUser: false,
                                },
                            })
                            .catch((err) => {
                                err.code == UNKHOWN_MESSAGE
                                    ? channel.send(msg)
                                    : null;
                            });
                    });
            } else {
                msg =
                    " Usa <#813564359874838558> | <#1172695535468150814> | <#1053118780705874040>";
                message
                    .reply({
                        content: msg,
                        allowedMentions: {
                            repliedUser: false,
                        },
                    })
                    .catch((err) => {
                        err.code == UNKHOWN_MESSAGE
                            ? channel.send(msg)
                            : null;
                    });
            }
        }
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}

export default module;
