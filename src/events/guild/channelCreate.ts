import { Guild, Events, TextChannel } from "discord.js"
import newChannelAdviser from "../../functions/lib/newChannelAdviser.js"
import IEvents from "../../interfaces/iEvents.js"
import dotenv from "dotenv"
dotenv.config()
const MAIN_SERVER = process.env.MAIN_SERVER

const module: IEvents = {
  name: Events.ChannelCreate,
  async execute(channel: TextChannel) {
    const { guild } = channel
    if (!(guild instanceof Guild)) return
    if (guild.id != MAIN_SERVER) return

    newChannelAdviser(channel)
  },
};
export default module
