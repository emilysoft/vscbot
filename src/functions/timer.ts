import Client from "../classes/ICustomClient.js"
const module = (hoy:Date, client:Client) => {
  const hora = hoy.getHours();
  const minutos = hoy.getMinutes();
  let channel = client.channels.cache.find(
    (channel) => channel.id === "813796911994896397"
  );
  //    let general = client.channels.cache.find(channel => channel.id === "813538324320092164")
  if (hora == 21 && minutos == 50) {
//    channel.send(
//      "**Hey!! Seria de muchisima ayuda si nos ayudas votando y comentando en Disboard y en TOP.GG:**\n**Disboard:** https://disboard.org/server/813538324320092161\n**TOP.GG**: https://top.gg/servers/813538324320092161/vote"
//    );
  }
  //    if(hora == 8 && minutos == 0){
  //        general.send("https://cdn.discordapp.com/attachments/813538324320092164/1058018597777195068/318448742_1557812098044336_6218322130156172565_n.mp4")
  //    }
  //    if(hora == 5 && minutos == 0) {
  //        general.send("https://cdn.discordapp.com/attachments/813538324320092164/1058016154104385577/319364263_229910879368048_452833875823050882_n.mp4")
  //    }
  //    if(hora == 9 && minutos == 0) {
  //        general.send("https://cdn.discordapp.com/attachments/813538324320092164/1055935810832187473/gatos.mp4")
  //    }
  //    if(hora == 10 && minutos == 0 || hora == 12 && minutos == 0 || hora == 19 && minutos == 0) {
  //        general.send("https://cdn.discordapp.com/attachments/813538324320092164/1055865972545814548/b13b58c69fdaa7c5.mp4")
  //    }
};
export default module
