const logger = require("./logger");
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
module.exports = (message, client) => {
  regex =
    /(\si|i)('ll|\swill)\s(help|teach)\s(the first|\w+)\s?((\S+\W+\D+)(\d{1,2}k|\$))/gim;
  if (message.content.match(regex) != null) {
    if (message.member.roles.cache.some((role) => role.id === lvl10)) return;
    if (message.member.roles.cache.some((role) => role.id === lvl5)) return;
    message.delete().catch((error) => {
      if (error.code !== 10008)
        console.error("Failed to delete the message in anti Crypto:", error);
    });

    message.member
      .ban({ reason: "Discord Invite spamming" })
      .catch((e) => console.error(e));
    logger(
      message,
      client,
      "Spam de crypto",
      "ha sido baneado por enviar spam de cripto"
    );
    //      const role = message.guild.roles.cache.find(role => role.name === "Muted");
    //      if(role) {
    //         message.guild.members.cache.get(message.author.id).roles.add(role,"Enviar mensaje de scam").catch(e => console.error(e))
    //         message.channel.send(`**${message.author.tag}** muteado por enviar scam`).then((r) => {
    //            setTimeout(()=> {
    //               r.delete().catch(r => console.error(r))
    //            },5000)
    //         })
    //     }
  }
};
