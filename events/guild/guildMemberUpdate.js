const { Events } = require('discord.js');
const errorLogger = require('../../functions/loggers/errorLogger');

module.exports = {
    ame: Events.GuildMemberUpdate,
    async execute(oldM, newM) {
        try {
        } catch (err) {
            errorLogger(err, guild.client, 'error')
        }        
    }
}