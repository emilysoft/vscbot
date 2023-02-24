const notifier = require("node-notifier");
const path = require("path");
module.exports = (message) => {
  if (
    message.content.split(" ").find((e) => e == "neet") ||
    message.content.split(" ").find((e) => e == "nit")
  ) {
    notifier.notify({
      title: message.author.username,
      message: message.content,
      icon: path.join(__dirname, "discord.png"),
      wait: true,
    });
  }
};
