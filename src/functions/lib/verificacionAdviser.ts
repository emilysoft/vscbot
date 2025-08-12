import { TextChannel, WebhookClient, GuildMember, Message, Guild, ChannelType } from 'discord.js';
import dotenv from "dotenv";
dotenv.config();

// --- Configuration ---
const UNVERIFIED_ROLE_ID = '1260331890406068325';
const WELCOME_CHANNEL_ID = '1345943077470076979';
const PING_CHANNEL_ID = '813538324320092164';
const WEBHOOK_URL = process.env.WEBHOOK_WELCOME_CHANNEL;
if (!WEBHOOK_URL) throw new Error("error al encontrar el webhook url")
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

// --- Seguimiento para el Saludo Grupal ---
const recentVerifications = new Map<string, { timestamp: number, userTag: string }>();
const GROUP_THRESHOLD = 2; // Cantidad de personas para el saludo grupal
const TIME_WINDOW = 30 * 1000; // 30 segundos

/**
 * Maneja los mensajes de bienvenida y los ghost pings cuando a un miembro se le quita el rol no verificado.
 * @param oldMember El miembro antes de la actualización.
 * @param newMember El miembro después de la actualización.
 */
async function handleWelcomeMessages(oldMember: GuildMember, newMember: GuildMember) {
    const guild = newMember.guild;
    if (guild.id != '813538324320092161') return
    // Verifica si el miembro ya no tiene el rol no verificado
    const wasUnverified = oldMember.roles.cache.has(UNVERIFIED_ROLE_ID);
    const isVerified = !newMember.roles.cache.has(UNVERIFIED_ROLE_ID);

    if (wasUnverified && isVerified) {
        const now = Date.now();
        recentVerifications.set(newMember.id, { timestamp: now, userTag: newMember.user.tag });

        // Limpia las verificaciones antiguas del mapa
        for (const [memberId, data] of recentVerifications.entries()) {
            if (now - data.timestamp > TIME_WINDOW) {
                recentVerifications.delete(memberId);
            }
        }

        const welcomeChannel = await guild.channels.fetch(WELCOME_CHANNEL_ID) as TextChannel;
        if (!welcomeChannel) return console.error('¡Canal de bienvenida no encontrado!');

        // --- Lógica del Mensaje de Bienvenida ---
        if (recentVerifications.size >= GROUP_THRESHOLD) {
            // Saludo grupal
            const userMentions = Array.from(recentVerifications.keys()).map(id => `<@${id}>`).join(' ');

            // Mensaje del webhook
            const sentMessage = await webhookClient.send({
                content: `bienvenidos <:holagawr:1116468570306642020> ${userMentions}`,
                allowedMentions: { users: Array.from(recentVerifications.keys()) }
            });

            setTimeout(() => {
                webhookClient.deleteMessage(sentMessage.id).catch(err => {
                    console.error('Error al intentar borrar el mensaje del webhook:', err);
                });
            }, 60000); // 60000 milisegundos = 1 minuto
        } else {
            // Mensaje de bienvenida individual
            const sentMessage = await webhookClient.send({
                content: `bienvenido <:holagawr:1116468570306642020> ${newMember}`
            })

            setTimeout(() => {
                webhookClient.deleteMessage(sentMessage.id).catch(err => {
                    console.error('Error al intentar borrar el mensaje del webhook:', err);
                });
            }, 60000); // 60000 milisegundos = 1 minuto

        }

        // --- Lógica del Ghost Ping ---
        const pingChannel = await guild.channels.fetch(PING_CHANNEL_ID) as TextChannel;
        if (pingChannel && pingChannel.type === ChannelType.GuildText) {
            const userMentionsForPing = Array.from(recentVerifications.keys()).map(id => `<@${id}>`).join(' ');

            // Envía un mensaje con las menciones y lo borra inmediatamente
            const pingMessage = await pingChannel.send({
                content: userMentionsForPing,
                allowedMentions: { users: Array.from(recentVerifications.keys()) }
            });
            await pingMessage.delete();
        }
    }
}

export default handleWelcomeMessages
