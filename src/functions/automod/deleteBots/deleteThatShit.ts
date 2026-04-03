import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";

// IDs para una gestión más limpia
const GENERAL_CHANNEL_IDS = ["813538324320092164", "1345943077470076979"];
const FMBOT_USER_ID = "356268235697553409";
const CHUU_USER_ID = "537353774205894676";
const NSB_BOT_ID = "439205512425504771";
const NSB_CHANNEL = "1112164583344443433";

export default {
    name: "deleteThatShit",
    scope: "guild",
    ignoreBots: false,
    execute: async function (message: Message, client: Client) {
        const { channel, author } = message;

        // Validar que el canal sea un TextChannel de inmediato.
        if (!(channel instanceof TextChannel)) {
            return;
        }

        try {
            // Manejar lógica para canales generales
            if (GENERAL_CHANNEL_IDS.includes(channel.id)) {
                await handleGeneralChannel(message);
            }

            // Manejar lógica para el bot NSB
            if (author.id === NSB_BOT_ID) {
                await handleNSBBot(message);
            }
        } catch (err: any) {
            // Ignorar errores de mensaje borrado
            if (err.code === 10008) return;
            // Registrar otros errores
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod;



/**
 * Maneja la lógica de borrado para los canales generales.
 * @param message El objeto Message de Discord.
 */
async function handleGeneralChannel(message: Message): Promise<void> {
    const { content, author } = message;

    // Borrar mensajes que empiezan con ".dl" o ">dl"
    if (/^(\.|>)\s*dl/i.test(content)) {
        message.delete();
        return;
    }

    // Borrar mensajes que empiezan con "=" y no son de un bot (ej. =fm)
    if (content.startsWith("=") && !author.bot) {
        message.delete();
        return;
    }

    // Borrar mensajes del bot "fmbot" después de 1 minuto
    if (author.id === FMBOT_USER_ID || author.id === CHUU_USER_ID ) {
        setTimeout(async () => message.delete(), 1000 * 60 * 2);
    }
}

/**
 * Maneja la lógica de borrado para el bot NSB.
 * @param message El objeto Message de Discord.
 */
async function handleNSBBot(message: Message): Promise<void> {
    const { guild, content, embeds } = message;

    const deleteDelay = 5000; // 5 segundos de espera para el borrado

    // Manejar mensajes de error específicos
    if (/Unknown Tag/gim.test(content)) {
        await deleteTempMessage(message, deleteDelay);
        return;
    }
    if (/URL returned an empty response/gim.test(content)) {
        await deleteTempMessage(message, deleteDelay);
        if (!guild) return
        const botsChannel = await guild.channels.fetch(NSB_CHANNEL)
        if (!(botsChannel instanceof TextChannel)) return
        botsChannel.send(`<@${guild.ownerId}>\n${message.content}`)
        return;
    }
    // Manejar embeds con errores
    if (embeds.length > 0 && embeds[0].title?.match(/Command Error/gim)) {
        await deleteTempMessage(message, deleteDelay);
    }
}

/**
 * Borra uno o varios mensajes después de un tiempo especificado.
 * @param message El mensaje a borrar.
 * @param delay El tiempo de espera en milisegundos.
 */
async function deleteTempMessage(message: Message, delay: number): Promise<void> {
    setTimeout(async () => {
        try {
            const messagesToDelete: string[] = [message.id];

            // Si el mensaje actual es una respuesta, incluir el mensaje original
            if (message.reference?.messageId) {
                const repliedMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                if (repliedMsg) {
                    messagesToDelete.push(repliedMsg.id);
                }
            }

            // Realizar el borrado masivo
            if (message.channel instanceof TextChannel && messagesToDelete.length > 0) {
                message.channel.bulkDelete(messagesToDelete);
            }
        } catch (err: any) {
            // Silenciar el error si el mensaje ya fue borrado
            if (err.code === 10008) return;
            console.error("Error al borrar mensaje temporal:", err);
        }
    }, delay);
}

/**
 * Maneja tags de notsobot que no fueron creados debidamente
 * @param message El objeto Message de Discord.
 */
export async function warningDumpNSBTagCreation(message: Message) {
    const { attachments, content, author } = message;
    if (attachments.size == 0) return
    if (/^\.\s*t\s+(add|create)/gim.test(content)) {
        if (!(message.channel instanceof TextChannel)) return
        message.channel.send(`<@${author.id}> posiblemente tu tag no se creó bien porque borraste la imagen/video, arregla tu mamada`)
    }
}
