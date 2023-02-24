module.exports = (message) => {
  if (message.author.id == "282859044593598464") {
    if (message.content.startsWith("**¡Bienvenido/a**")) {
      message.react("👋").catch((e) => console.log(e));
      message.reply("<@&1049626515849084988>").then((msg) => {
        setTimeout(() => {
          msg.delete().catch((error) => {
            if (error.code !== 10008)
              console.error("Failed to delete the message in welcome:", error);
          });
        });
      });
    }
  }
};
