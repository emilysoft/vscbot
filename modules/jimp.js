const Jimp = require("jimp");
module.exports = async (imageId, message) => {
  console.log("ejecutando jimp");
  Jimp.read(`./modules/media/${imageId}.png`)
    .then((Input) => {
      return Input.resize(320, Jimp.AUTO);
    })
    .then((Input) => {
      Jimp.read("./media/globo.png").then((Globo) => {
        return Globo.contain(
          320,
          Globo.bitmap.height + Input.bitmap.height,
          Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP
        )
          .blit(Input, 0, 105)
          .writeAsync(`./media/globos/${imageId}.png`)
          .then(() => {
            send();
          });
      });
    });
  async function send() {
    console.log("enviando");
    await message.channel
      .send({
        files: [
          {
            attachment: `./media/globos/${imageId}.png`,
            name: "img.png",
          },
        ],
      })
      .then(() => {
        console.log("enviado");
      })
      .catch((err) => {
        if (err.code == 500) {
          console.error(`hubo un error ${err.code}`);
        }
      });
  }
};
