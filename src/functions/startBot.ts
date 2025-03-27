import {TextChannel} from "discord.js"
import Client from "../classes/ICustomClient.js"
const module = async (client:Client) => {
    const guild = client.guilds.cache.get("813538324320092161")
    if(!guild) return
    const channel = await guild.channels.fetch("1024260771326197781")
    if(!channel) return
    if(channel instanceof TextChannel != true) return
    channel.send("bot iniciado");
};


export default module
