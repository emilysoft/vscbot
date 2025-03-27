import { ReadonlyCollection, Snowflake, GuildMember, Events, Guild, GuildMembersChunk } from 'discord.js'
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
const module: IEvents = {
    name: Events.GuildMembersChunk,
    async execute(members:ReadonlyCollection<Snowflake, GuildMember>, guild:Guild, chunk:GuildMembersChunk) {
        try {

        } catch (err) {
            client.errorLogger(err, client, 'error')
        }        
    }
}
export default module
