const getIds = require("../../functions/getIds");
const errorLogger = require("../../functions/loggers/errorLogger");
const Jimp = require("jimp");
const path = require("node:path");
const { OWNERS_ID } = require("../../config.json");
module.exports = {
    name: "seticon",
    data: "",
    async execute(message) {
        try {
            const AUTHOR_ID = message.author.id;
            if (!OWNERS_ID.some((id) => id === AUTHOR_ID)) return;
            const id = getIds(message.content);
            const image = message.attachments.first();
            if (id.length == 1) {
                const targetRole = id[0];
                const role = message.guild.roles.cache.get(targetRole);
                if (!role)
                    return message.channel.send(
                        `<@${message.author.id}> especifique un id de role valido.`
                    );

                if (message.attachments.size >= 1) {
                    if (
                        image.contentType == "image/jpeg" ||
                        image.contentType == "image/png" ||
                        image.contentType == "image/gif" ||
                        image.contentType == "image/webp"
                    ) {
                        await Jimp.read(image.attachment)
                            .then((input) => {
                                return input
                                    .resize(150, 150) // resize
                                    .writeAsync(
                                        path.join(
                                            __dirname,
                                            `./icons/${message.id}.png`
                                        )
                                    );
                            })
                            .then(async () => {
                                await role
                                    .setIcon(
                                        path.join(
                                            __dirname,
                                            `./icons/${message.id}.png`
                                        ),
                                        "Set new icon"
                                    )
                                    .then(() => {
                                        message.channel.send(
                                            `Icon colocado exitosamente.`
                                        );
                                    });
                            });
                    } else {
                        message.channel.send(
                            `<@${message.author.id}> Por favor inserte una imagen jpg/png/gif.`
                        );
                    }
                } else {
                    message.channel.send(
                        `<@${message.author.id}> Por favor adjunte una imagen.`
                    );
                }
            } else {
                message.channel.send(
                    `<@${message.author.id}> Por favor especifique una (@mencion o ID).`
                );
            }
        } catch (err) {
            message.channel.send("Hubo un error al intentar ");
            errorLogger(err, message.client, "error");
        }
    },
};
