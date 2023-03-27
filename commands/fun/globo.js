const {SlashCommandBuilder } = require("discord.js")
const path = require("node:path");
const errorLogger = require("../../functions/loggers/errorLogger");
const Jimp = require("jimp");
const imageLimit = 2000000;
module.exports = {
    name: "gb",
    data: new SlashCommandBuilder()
        .setName("gb")
        .setDescription("Crea un globo encima de una imagen adjuntada"),
    slashCommand: false,
    messageCommand: true,
    description: "Crea un globo encima de una imagen adjuntada.",
    async run(message) {
        try {
            if (message.attachments.size == 0) {
                return message.reply({
                    content: `adjunta una imagen.`,
                    allowedMentions: { repliedUser: false },
                });
            } else {
                const image = message.attachments.first();
                if (image.size < imageLimit) {
                    if (
                        image.contentType == "image/jpeg" ||
                        image.contentType == "image/png" ||
                        image.contentType == "image/gif"
                    ) {
                        message.delete();
                        Jimp.read(image.attachment)
                            .then((Input) => {
                                return Input.resize(320, Jimp.AUTO);
                            })
                            .then((Input) => {
                                Jimp.read(
                                    path.join(__dirname, "./media/globo.png")
                                ).then(async (Globo) => {
                                    return Globo.contain(
                                        320,
                                        Globo.bitmap.height +
                                            Input.bitmap.height,
                                        Jimp.HORIZONTAL_ALIGN_LEFT |
                                            Jimp.VERTICAL_ALIGN_TOP
                                    )
                                        .blit(Input, 0, 105)
                                        .writeAsync(
                                            path.join(
                                                __dirname,
                                                `./media/${message.id}.png`
                                            )
                                        )
                                        .then(async () => {
                                            await message.channel.send({
                                                files: [
                                                    {
                                                        attachment: path.join(
                                                            __dirname,
                                                            `./media/${message.id}.png`
                                                        ),
                                                        name: "vsc-globo.png",
                                                    },
                                                ],
                                            });
                                        });
                                });
                            });
                    } else {
                        message.reply({
                            content: `Envia una imagen.`,
                            allowedMentions: { repliedUser: false },
                        });
                    }
                } else {
                    message.reply({
                        content: `Tu imagen excede el limite de peso de ${
                            String(imageLimit)[0]
                        }MB.`,
                        allowedMentions: { repliedUser: false },
                    });
                }
            }
        } catch (err) {
            errorLogger(err, message.client, "error");
        }
    },
};
