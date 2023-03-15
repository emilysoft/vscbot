const logger = require("../loggers/logger");
const lvl10 = "813546760152547348";
const lvl5 = "813545491957940244";
module.exports = (message, client) => {
  if (message.author.bot) return;
  regex =
    /(https?:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gim;
  if (message.content.match(regex) != null) {
    if (message.member.roles.cache.some((role) => role.id === lvl10)) return;
    if (message.member.roles.cache.some((role) => role.id === lvl5)) return;
    message.member
      .ban({ reason: "Discord Invite" })
      .catch((e) => console.error(e));
    message.delete().catch((error) => {
      if (error.code !== 10008)
        console.error(
          "Failed to delete the message in banDiscordInvite:",
          error
        );
    });
    logger(
      message,
      client,
      "Discord Invite",
      "Ha sido baneado por enviar discord invite al ser un usuario nuevo"
    );
  }
};
