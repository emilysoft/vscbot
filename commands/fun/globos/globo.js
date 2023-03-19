const path = require("node:path");
const errorLogger = require("../../../functions/loggers/errorLogger");
const jimp = require("./jimp");
module.exports = {
    name: "globo",
    description: "Crea un globo encima de una imagen adjuntada.",
    aliases: ["globo", "gb"],
    async run(message) {
        try {
            message.delete();
            if (message.attachments.size == 1) {
                message.attachments.each((image) => {
                    if (image.size < 1000000) {
                        if (
                            image.contentType == "image/jpeg" ||
                            image.contentType == "image/png" ||
                            image.contentType == "image/gif"
                        ) {
                            console.log("ejecutando jimp");
                            Jimp.read(image.attachment)
                                .then((Input) => {
                                    return Input.resize(320, Jimp.AUTO);
                                })
                                .then((Input) => {
                                    Jimp.read(
                                        path.join(
                                            __dirname,
                                            "./media/globo.png"
                                        )
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
                                                    `./media/result/${message.id}.png`
                                                )
                                            )
                                            .then(async () => {
                                                console.log("enviando globo");
                                                await message.channel
                                                    .send({
                                                        files: [
                                                            {
                                                                attachment:
                                                                    path.join(
                                                                        __dirname,
                                                                        `./media/result/${message.id}.png`
                                                                    ),
                                                                name: "vsc-globo.png",
                                                            },
                                                        ],
                                                    })
                                                    .then(() => {
                                                        console.log("enviado");
                                                    });
                                            });
                                    });
                                });
                        } else {
                            console.log(
                                `envia una imagen ${message.author.id}`
                            );
                            message.reply("Envia una imagen.").then((msg) => {
                                setTimeout(() => {
                                    msg.delete();
                                }, 10000);
                            });
                        }
                    } else {
                        console.log(
                            `tu imagen excede el limite de peso ${message.author.id}`
                        );
                        message
                            .reply("Tu imagen excede el limite de peso de 1MB.")
                            .then((msg) => {
                                setTimeout(() => {
                                    msg.delete();
                                }, 10000);
                            });
                    }
                });
            } else if (message.attachments.size == 0) {
                console.log(`Envia una imagen. ${message.author.id}`);
                message.channel
                    .send(`<@${message.author.id}> adjunta una imagen.`)
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 10000);
                    });
            } else {
                console.log(`Envia una imagen a la vez. ${message.author.id}`);
                message.reply("Envia una imagen a la vez.").then((msg) => {
                    setTimeout(() => {
                        msg.delete();
                    }, 10000);
                });
            }
        } catch (err) {
            errorLogger(err, message.client, 'error')
        }
    },
};
