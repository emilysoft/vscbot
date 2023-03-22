const { Events } = require('discord.js');
const errorLogger = require('../../functions/loggers/errorLogger')

module.exports = {
    ame: Events.GuildMembersChunk,
    async execute(members, guild, chunk) {
        try {

        } catch (err) {
            errorLogger(err, guild.client, 'error')
        }        
    }
}