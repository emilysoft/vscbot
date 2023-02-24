module.exports = (message) => {
  if (message.author.id != "302249242469335060") return;
  const roleName = "😎ໄCEO del machismo";
  var args = message.content.substring(">".length).split(" ").slice(1);
  const role = message.guild.roles.cache.find((role) => role.name === roleName);
  if (role) {
    args.forEach((user) => {
      let usuario = message.guild.members.cache.get(user);
      if (usuario == undefined) {
        message.channel
          .send(`Error al asignar el role al id ${user}.`)
          .catch((e) => {
            console.error(e);
          });
        return;
      }
      usuario.roles
        .add(role, `Asignación de rol`)
        .then(() => {
          message.channel.send(`Role asignado a <@${user}> exitosamente`);
        })
        .catch((e) => {
          message.channel.send(`Error al asignar el role al id ${user}.`);
          console.error(e);
        });
    });
  } else {
    console.error("role no encontrado");
  }
};
