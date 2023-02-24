const Axios = require("axios");
var toggle;
const on = "⛏MINECRAFT SERVER 🌐ON";
const off = "⛏MINECRAFT SERVER 🔴OFF";
module.exports = (client, categoryId, onlineChannelID) => {
  var category = client.channels.cache.get(categoryId);
  //    var channel = client.channels.cache.get(onlineChannelID);
  Axios.get("https://api.mcsrvstat.us/2/206.62.172.132:25565")
    .then(({ data }) => {
      if (data.debug.ping) {
        if (toggle) return;
        category.setName(on);
        //           channel.setName(`Conectados: ${data.players.online}/${data.players.max}`)
        toggle = true;
      } else {
        if (toggle === false) return;
        category.setName(off);
        //            channel.setName(`Conectados: 0/0`)
        toggle = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
