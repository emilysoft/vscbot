import errorLogger from "./loggers/errorLogger.js"
const guildID = "813538324320092161";
const module = async (time, client) => {
    try {
  
      const minutes = time.getMinutes()
      if(minutes != 0) return

      let guild = client.guilds.cache.get(guildID);
      if(!guild) console.log(`error, ${guildID} no conseguido`)
      let role = guild.roles.cache.get("1147197053911433436")
      if(!role) return  console.log(`error, rol title no conseguido`)
      let counter = guild.members.cache.filter(member => member.presence?.status == "online" || member.presence?.status == "idle").size
      let title = `${counter} usuarios conectados`
      await role.setName(title);
    } catch (err) {
        errorLogger(err, client, "error");
    }
}
export default module
