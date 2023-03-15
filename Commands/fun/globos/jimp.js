const path = require("node:path");
const Jimp = require("jimp");
module.exports = async (source, message) => {
    const imageId = message.id;
    console.log("ejecutando jimp");
    Jimp.read(source)
        .then((Input) => {
            return Input.resize(320, Jimp.AUTO);
        })
        .then((Input) => {
            Jimp.read(path.join(__dirname, "./media/globo.png")).then(
                async (Globo) => {
                    return Globo.contain(
                        320,
                        Globo.bitmap.height + Input.bitmap.height,
                        Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP
                    )
                        .blit(Input, 0, 105)
                        .writeAsync(
                            path.join(
                                __dirname,
                                `./media/result/${imageId}.png`
                            )
                        )
                        .then(() => {
                            console.log("enviando globo");
                            message.channel
                                .send({
                                    files: [
                                        {
                                            attachment: path.join(
                                                __dirname,
                                                `./media/result/${imageId}.png`
                                            ),
                                            name: "vsc-globo.png",
                                        },
                                    ],
                                })
                                .then(() => {
                                    console.log("enviado");
                                });
                        });
                }
            );
        });
};
