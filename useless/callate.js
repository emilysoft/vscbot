const insulto = [
  "maldito",
  "vergacion maldito",
  "mardito trimardito",
  "recontramardito",
  "mamaguebo mardito",
  "cromador de miembro empedernido barato",
];
module.exports = (message) => {
  //  args = message.content.split(" ")
  if (
    //args.find(e => e == "JUGADOR 2022 ELIMINADO") ||
    message.content == "JUGADOR 2022 ELIMINADO" ||
    message.content == "Jugador 2022 eliminado" ||
    message.content == "jugador 2022 eliminado"
  ) {
    message.reply(
      `callate ${insulto[Math.floor(Math.random() * insulto.length)]}`
    );
  }
};
