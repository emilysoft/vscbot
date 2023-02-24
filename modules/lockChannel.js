module.exports = async (hoy, client) => {
  const vscID = "813538324320092161",
    targetChannelId = "813796911994896397";
  var vsc = await client.guilds.cache.get(vscID),
    targetChannel = await vsc.channels.cache.find(
      (channel) => channel.id === targetChannelId
    ),
    everyone = await vsc.roles.cache.find((r) => r.id === vscID);
  while (typeof targetChannel == "undefined") {
    targetChannel = await vsc.channels.cache.find(
      (channel) => channel.id === targetChannelId
    );
  }
  if (hoy.getHours() == 22 && hoy.getMinutes() == 0) {
    //    if(targetChannel.permissionOverwrites.cache.get(vscID).deny.bitfield != SEND_MESSAGES){
    targetChannel.permissionOverwrites
      .edit(everyone, { SendMessages: false })
      .then(() => {
        console.log(`el canal bump ha sido cerrado ${hoy}`);
        //        targetChannel.messages.fetch({ limit: 1}).then(messages => {
        //let lastMessage = messages.first();
        //if (lastMessage.author.id != '883827073049845801') {
        //targetChannel.send('Canal cerrado hasta mañana a las 8am.').catch(e => console.error(e))
        //}
        //})
        targetChannel
          .send("Canal cerrado hasta mañana a las 8am.")
          .catch((e) => console.error(e));
        //.catch(console.error);
      })
      .catch((error) => console.error(error));
  }
  //  }
  else if (hoy.getHours() == 8 && hoy.getMinutes() == 0) {
    //comprobar si el canal esta bloqueado para everyone
    //    if(targetChannel.permissionOverwrites.cache.get(vscID).deny.bitfield == SendMessages){
    targetChannel.permissionOverwrites
      .edit(everyone, { SendMessages: true })
      .then(() => {
        console.log(`El canal bump ha sido abierto. ${hoy} `);
        targetChannel
          .send(
            `Buenos días, ya puedes bumpear **/bump**  <@&1015669369218539641>`
          )
          .catch((e) => console.error(e));
        //targetChannel.send(`Buenos días, ya puedes bumpear **/bump**`).catch(e => console.error(e))
      })
      .catch((error) => console.error(error));
  }
  //  }
};
