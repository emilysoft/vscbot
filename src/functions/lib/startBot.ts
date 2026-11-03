import {TextChannel} from "discord.js"
import Client from "../../interfaces/ICustomClient.js"
import config from "../../config/index.js"
const module = async (client:Client) => {
  const guild = client.guilds.cache.get(config.guilds.main)
  if(!guild) return
  const channel = await guild.channels.fetch(config.channels.panel)
  if(!channel) return
  if(channel instanceof TextChannel != true) return
  channel.send("bot iniciado");
};


export default module
