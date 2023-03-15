module.exports = (client) => {
  const vscID = "813538324320092161",
    targetChannelId = "813796911994896397";
  let vsc = client.guilds.cache.get(vscID),
    targetChannel = vsc.channels.cache.find(
      (channel) => channel.id === targetChannelId
    ),
    testRole = vsc.roles.cache.find((r) => r.id === vscID);
  while (typeof targetChannel == "undefined") {
    targetChannel = vsc.channels.cache.find(
      (channel) => channel.id === targetChannelId
    );
  }
  let now = new Date();
  //comprueba si son las 8
  if (now.getHours() >= 20 || now.getHours() < 8) {
    return;
  } else {
    targetChannel
      .send("Bumpeaa!")
      .catch((e) => console.error(e))
      .then((msg) => {
        setTimeout(() => {
          msg.delete().catch((error) => {
            if (error.code !== 10008)
              console.error("Error al intentar borrar el mensaje:", error);
          });
        }, 500);
      });
  }
};
