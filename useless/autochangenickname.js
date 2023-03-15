/**
 1.- Guardar todos los nicknames junto a sus id de los presentes y nuevos usuarios, si este no tiene nickname, guardar el username.
 2.- Colocar apodo con username + calabaza, si este tiene username seria username + calabaza, en caso de que no quepa se ignorara 
 3.- Cargar desde la base de datos los y id y sus nombres
 */
module.exports = (usuario) => {
  if (usuario.user.username.length < 32) {
    console.log("cambiando nickname a " + usuario.user.username);
    usuario
      .setNickname(`${usuario.user.username}🎃`)
      .catch((e) => console.error(e));
  }
};
