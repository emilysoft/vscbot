const path = require("path");
const notifier = require("node-notifier");
module.exports = (message, targetChannelId) => {
  if (
    message.author.id == "302050872383242240" &&
    message.channelId == targetChannelId
  ) {
    let now = new Date();
    //comprueba si son las 8
    if (now.getHours() >= 8 && now.getHours() < 20) {
      setTimeout(() => {
        //message.channel.send("Ya puedes bumpear de nuevo **/bump**")
        message.channel
          .send("Ya puedes bumpear de nuevo **/bump** <@&1015669369218539641>")
          //        message.channel.send("Ya puedes bumpear de nuevo **/bump** <@302249242469335060>")
          .catch((error) => console.error(error));
        //notifier.notify({
        //message: "Ya puedes bumpear de nuevo",
        //icon: path.join(__dirname, 'logo.png'),
        //wait: true
        //});
      }, 7200000);
    }
  }
};
