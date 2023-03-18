vscLog = require("../loggers/automodLogger);
module.exports = (message, client, targetChannel) => {
  if (message.channelId != targetChannel) return;
  if (message.author.id == "302249242469335060") return;
  if (message.attachments.size >= 3) {
    console.warn(`Se borraron ${message.attachments.size} imágenes`);
    message.delete().catch((error) => {
      if (error.code !== 10008)
        console.error("Error al intentar borrar el mensaje:", error);
    });
    message.channel
      .send(
        `<@${message.author.id}> utiliza <#813562445729628170> para pasar lotes de imágenes o vídeos.`
      )
      .catch((error) => {
        console.error(error);
      })
      .then((msg) => {
        setTimeout(() => {
          msg.delete().catch((error) => {
            if (error.code !== 10008)
              console.error("Error al intentar borrar el mensaje:", error);
          });
        }, 10000);
      });

    vscLog(
      message,
      client,
      "Un lote de más de 3 imágenes o videos fueron borrados",
      `<@${message.author.id}> pasó demasiadas imágenes o vídeos.`
    );
  }
};
