import { Events } from 'discord.js'
import errorLogger from '../../functions/loggers/errorLogger.js'

const module = {
    name: Events.GuildMemberUpdate,
    async execute(oldM, newM) {
        try {
        } catch (err) {
            errorLogger(err, guild.client, 'error')
        }        
    }
}
export default module
