module.exports = (client, aliases, callback) => {
  const { prefix } = require("./config_vsc.json");
  console.log("commands_vsc working");
  const antiWalltexts = require("./walltext");

  if (typeof aliases === "string") {
    aliases = [aliases];
  }

  client.on("messageCreate", async (message) => {
    console.log(message);
    //comando para darle exclusividad al bot
    //if(message.guildId != 8118272564895416 || 813538324320092161) return;
    if (antiWalltexts(message, client) == 0) return;
    if (!message.content.startsWith(prefix)) return;
    //borrador de walltexts

    const { content } = message;
    //console.log(content);
    aliases.forEach((alias) => {
      const command = `${prefix}${alias}`;

      if (content.startsWith(`${command} `) || content === command) {
        console.log(`Running the command ${command}`);
        callback(message);
      }
    });
  });
};
