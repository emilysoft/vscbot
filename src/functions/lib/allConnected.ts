import Client from "../../interfaces/ICustomClient.js"
const guildID = "813538324320092161";
const module = async (time:Date, client:Client) => {
    try {
  
      const minutes = time.getMinutes()
      if(minutes != 0) return

      let guild = client.guilds.cache.get(guildID);
      if(!guild) return console.log(`error, ${guildID} no conseguido`)
      let role = guild.roles.cache.get("1147197053911433436")
      if(!role) return  console.log(`error, rol title no conseguido`)
      let counter = guild.members.cache.filter(member => member.presence?.status == "online" || member.presence?.status == "idle").size
      let title = `${counter} usuarios conectados`
      await role.setName(title);
    } catch (err) {
        client.errorLogger(err, client, "error", process.cwd() + " ");
    }
}
export default module
