const errorLogger = require('../functions/loggers/errorLogger')
const getIds = require('../functions/getIds')
module.exports = {
    name: 'mute',
    description: 'Mutea uno o más usuarios.',
    aliases: ['mute', 'm'],
    async run(message) {
        try {
            //if (message.member.roles.cache.some((role) => role.id != '844230283737038848')
            //) return;

            const muted = message.guild.roles.cache.find(
                (role) => role.name === "Muted"
            );
            if (!muted) {
                await message.channel.send("No existe un rol llamado Muted.")
                return
            }

            const ids = getIds(message.content)
            if (ids.length == 0) {
                await message.channel.send('Especifique uno más miembros a mutear.')
                return
            }
            const mutedUsers = []
            ids.forEach((id) => {
                message.guild.members.cache.find((member) => {
                    if (member.id == id) {
                        console.log(member)
                        member.roles.addRole(muted, "")
                            .then(() => {
                                console.log("muteado exitosamente")
                                mutedUsers.push(`\n<@${id}> ha sido muteado.`)
                            })
                            .catch(e => {
                                mutedUsers.push(`\n<@${id}> error al intentar mutearlo.`)
                            })
                    }
                })
            })

            //            await message.channel.send(...mutedUsers)
        } catch (e) {
            errorLogger(e, message.client, 'error')
        }
    }
}