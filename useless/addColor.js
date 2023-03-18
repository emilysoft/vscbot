module.exports = (message) => {
  let toggle = true;
  const naranja = message.guild.roles.cache.find(
    (role) => role.name === "naranja"
  );
  if (naranja) {
    message.guild.members.cache.find((member) => {
      toggle ? (toggle = false) : (toggle = true);
      if (toggle) {
        console.log("si");
        return;
      } else {
        console.log("no");
      }
      member.roles
        .add(naranja, "evento halloween 2022")
        .then(() => {
          console.log("role agregado");
        })
        .catch((e) => console.error(e));
    });
  }
  /**
      if(naranja){
        member.author
      }
            if(member.nickname != null)  {
                if(member.nickname.slice(-2) == "🎃") return
                if(member.nickname.length < 32 ) {
                   console.log("cambiando nickname a" + member.nickname)
                   member.setNickname(`${member.nickname}🎃`).catch(e => console.error(e))
				} 
			}
            else {
                if(member.user.username.slice(-2) == "🎃") return
                if(member.user.username.length < 32) {
                    console.log("cambiando nickname a " + member.user.username)
                    member.setNickname(`${member.user.username}🎃`).catch(e => console.error(e))
                }
            }
		})
*/
};
