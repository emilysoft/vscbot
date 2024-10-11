import { Events } from "discord.js"
import newChannelAdviser from "../../functions/newChannelAdviser.js"
const module = {
    name: Events.ChannelCreate,
    async execute(channel) {
        newChannelAdviser(channel)
    },
};
export default module
