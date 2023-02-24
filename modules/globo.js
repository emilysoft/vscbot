const downloadImage = require("./downloadImage");
const jimp = require("./jimp");
module.exports = async (message, dir) => {
  //descarga la imagen y la procesa
  message.delete().catch((error) => {
    if (error.code != 10008)
      console.error("error al intentar borrar el mensaje en globo", error);
  });

  if (message.attachments.size == 1) {
    message.attachments.each((image) => {
      if (image.size < 1000000) {
        if (
          image.contentType == "image/jpeg" ||
          image.contentType == "image/png" ||
          image.contentType == "image/gif"
        ) {
          downloadImage(image.attachment, image.id, dir)
            .then(() => {
              jimp(image.id, message);
            })
            .catch((e) => console.log(e));
        } else {
          console.log(`envia una imagen ${message.author.id}`);
          message.reply("Envia una imagen.").then((msg) => {
            setTimeout(() => {
              msg.delete().catch((error) => {
                if (error.code !== 10008)
                  console.error(
                    "Error al intentar borrar el mensaje en globo:",
                    error
                  );
              });
            }, 10000);
          });
        }
      } else {
        console.log(`tu imagen excede el limite de peso ${message.author.id}`);
        message
          .reply("Tu imagen excede el limite de peso de 1MB.")
          .then((msg) => {
            setTimeout(() => {
              msg.delete().catch((error) => {
                if (error.code !== 10008)
                  console.error(
                    "Error al intentar borrar el mensaje en globo:",
                    error
                  );
              });
            }, 10000);
          });
      }
    });
  } else if (message.attachments.size == 0) {
    console.log(`Envia una imagen a la vez. ${message.author.id}`);
    message.channel
      .send(`<@${message.author.id}> adjunta una imagen.`)
      .catch((error) => {
        console.error(error);
      })
      .then((msg) => {
        setTimeout(() => {
          msg.delete().catch((error) => {
            if (error.code !== 10008)
              console.error(
                "Error al intentar borrar el mensaje en globo:",
                error
              );
          });
        }, 10000);
      });
  } else {
    console.log(`Envia una imagen a la vez. ${message.author.id}`);
    message.reply("Envia una imagen a la vez.").then((msg) => {
      setTimeout(() => {
        msg.delete().catch((error) => {
          if (error.code !== 10008)
            console.error(
              "Error al intentar borrar el mensaje en globo:",
              error
            );
        });
      }, 10000);
    });
  }
};
