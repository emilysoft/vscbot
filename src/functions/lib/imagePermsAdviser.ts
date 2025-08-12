import { GuildMember, TextChannel } from "discord.js"
const allowedRoles = ['813545491957940244'];
const bots_id = '1112164583344443433'
async function aviser(oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember.guild.id != '813538324320092161') return

    // Busca si el usuario ha recibido el rol
    const hasRole = newMember.roles.cache.some(role => allowedRoles.includes(role.id));
    const hadRole = oldMember.roles.cache.some(role => allowedRoles.includes(role.id));

    // Si el usuario acaba de obtener el rol y no lo tenía antes
    if (hasRole && !hadRole) {
        const botsChannel = await oldMember.guild.channels.fetch(bots_id)
        if (!(botsChannel instanceof TextChannel)) return
        // Envía un mensaje directo al usuario
        botsChannel.send(`¡Felicidades! 🎉 Has obtenido el rol **"Rol 5"**. Ahora puedes enviar imágenes y enlaces en los canales.<@${oldMember.user.id}>`)
    }
}

export default aviser
