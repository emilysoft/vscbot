import Client from "../../interfaces/ICustomClient.js"
import config from "../../config/index.js";
const guildID = config.guilds.main;
const module = async (time: Date, client: Client) => {
  try {

    const minutes = time.getMinutes()
    if (minutes != 0) return

    const guild = client.guilds.cache.get(guildID);
    if (!guild) return console.log(`allconnect: error, ${guildID} no conseguido`)
    const role = guild.roles.cache.get(config.roles.connectedCounter)
    if (!role) return console.log(`error, rol title no conseguido`)
    const counter = guild.members.cache.filter(member => member.presence?.status == "online" || member.presence?.status == "idle").size
    const title = `${counter} usuarios conectados`
    await role.setName(title);
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
}
export default module
