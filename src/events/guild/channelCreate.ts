import { Events, TextChannel } from "discord.js"
import newChannelAdviser from "../../functions/newChannelAdviser.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
    name: Events.ChannelCreate,
    async execute(channel:TextChannel) {
        newChannelAdviser(channel)
    },
};
export default module
