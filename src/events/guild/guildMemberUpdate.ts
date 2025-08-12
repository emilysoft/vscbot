import { Events, GuildMember } from 'discord.js'
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
import aviser from "../../functions/lib/imagePermsAdviser.js"
import handleWelcomeMessages from '../../functions/lib/verificacionAdviser.js'

const module: IEvents = {
    name: Events.GuildMemberUpdate,
    async execute(oldM: GuildMember, newM: GuildMember) {
        try {
            await aviser(oldM, newM)
            await handleWelcomeMessages(oldM, newM)
        } catch (err) {
            client.errorLogger(err, client, 'error')
        }
    }
}
export default module
