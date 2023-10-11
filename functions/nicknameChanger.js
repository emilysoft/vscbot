/**
 1.- Guardar todos los nicknames junto a sus id de los presentes y nuevos usuarios, si este no tiene nickname, guardar el username.
 2.- Colocar apodo con username + calabaza, si este tiene username seria username + calabaza, en caso de que no quepa se ignorara 
 3.- Cargar desde la base de datos los y id y sus nombres
 */
module.exports = (client) => {
    const svId = "826231933243097098";
    const servidor = client.guilds.cache.find((guild) => guild.id === svId);
    servidor.members.cache.find((member) => {
        // if(member.user.bot) return
        if (member.nickname != null) {
            if (member.nickname.length < 32) {
                console.log("cambiando nickname a" + member.nickname);
                member
                    .setNickname(`${member.nickname}🎃`)
                    .catch((e) => console.error(e));
            }
        } else {
            if (member.user.username.length < 32) {
                console.log("cambiando nickname a " + member.user.username);
                member
                    .setNickname(`${member.user.username}🎃`)
                    .catch((e) => console.error(e));
            }
        }
    });
};
