import { Events } from 'discord.js'
import errorLogger from '../../functions/loggers/errorLogger.js'

const module = {
    name: Events.GuildMembersChunk,
    async execute(members, guild, chunk) {
        try {

        } catch (err) {
            errorLogger(err, guild.client, 'error')
        }        
    }
}
export default module
