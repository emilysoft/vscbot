import { Events, GuildMember } from 'discord.js'
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
    name: Events.GuildMemberUpdate,
    async execute(oldM:GuildMember, newM:GuildMember) {
        try {
        } catch (err) {
            client.errorLogger(err, client, 'error')
        }        
    }
}
export default module
