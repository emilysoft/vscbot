module.exports = (message) => {
  if (message.channelId == "815031494359253002") {
    if (message.content.startsWith("!") || message.content.startsWith("neko")) {
      message.delete().catch((error) => {
        if (error.code !== 10008)
          console.error("Failed to delete the message in nsfwbot:", error);
      });
      message.channel
        .send(
          `<@${message.author.id}> Ahora el comando para hacer confesiones es **/confess.**`
        )
        .then((msg) => {
          setTimeout(() => {
            msg.delete().catch((error) => {
              if (error.code !== 10008)
                console.error(
                  "Failed to delete the message in nsfwbot:",
                  error
                );
            });
          }, 10000);
        });
    }
  }

  if (message.channelId == "813564359874838558") {
    if (message.content.startsWith("!") || message.content.startsWith("neko")) {
      message
        .reply("Utiliza <#1052733551893827644> para bots roleplay")
        .then((msg) => {
          setTimeout(() => {
            msg.delete().catch((error) => {
              if (error.code !== 10008)
                console.error(
                  "Failed to delete the message in nsfwbot:",
                  error
                );
            });
          }, 5000);
        });
    }
  }
};
