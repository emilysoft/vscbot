module.exports = (message, client, vscLog) => {
  const englishChannelId = "891123662818783252";
  if (message.channelId != englishChannelId) return;
  //if(message.author.bot) return
  let args = message.content.split("");
  let args2 = message.content.split(" ");
  if (
    args.includes("ñ") ||
    args.includes("Ñ") ||
    args2.includes("n-word") ||
    args2.includes("N-WORD") ||
    args2.includes("nigga") ||
    args2.includes("NIGGA")
  ) {
    message.delete().catch((error) => {
      if (error.code !== 10008)
        console.error(
          "Error al intentar borrar el mensaje en el canal del ingles:",
          error
        );
    });

    message.channel
      .send(
        `<@${message.author.id}>` +
          ` Please don't say that again or you'll be banned from this channel.`
      )
      .catch((error) => {
        console.log(error);
      })
      .catch((error) => {
        console.error(
          error +
            "hubo un error al intentar enviar el mensaje please dont say that again"
        );
      })
      .then((msg) => {
        setTimeout(() => {
          msg.delete().catch((error) => {
            if (error.code !== 10008)
              console.error("Error al intentar borrar el mensaje:", error);
          });
        }, 10000);
        console.log(" A bad word in english channel was deleted");
        vscLog(
          message,
          client,
          `Palabra prohibida borrada`,
          `<@${message.author.id}> escribió: ${message.content}`
        );
      });
  }
};
