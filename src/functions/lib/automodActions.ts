import { TextChannel, Message } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import sendDM from "../lib/sendDM.js";
import logger from "../logger.js";
//import { createWorker } from 'tesseract.js';
// ---
//  Mensajes de sanción estandarizados
// ---

const ACCOUNT_HACKED_MESSAGE =
    "Has sido kickeado/a del servidor porque tu cuenta de Discord ha sido hackeada. Revisa tus DMs, borra los mensajes de spam que has enviado, cambia tu contraseña y regresa de nuevo si es necesario.";

// ---
//  Funciones para aplicar sanciones
// ---

/**
 * Mutea a un miembro y aplica un timeout.
 * @param message El objeto del mensaje de Discord.
 * @param client El cliente de Discord.
 * @param reason La razón del muteo.
 */
export function muteUser(message: Message, client: Client, reason: string): void {
    const { guild, member } = message;
    if (!guild || !member) return;

    const mutedRole = guild.roles.cache.find((role) => role.name === "Muted");
    if (!mutedRole) {
        throw new Error("El rol 'Muted' no se ha encontrado.");
    }

    member.roles
        .add(mutedRole, `Enviar ${reason}`)
        .then(() => {
            member.timeout(null); //  Aplica un timeout temporal
            sendDM(message, `Has sido muteado por enviar ${reason}`);
        })
        .catch((error) => {
            client.errorLogger(error, client, "error", "Error al mutear usuario.");
        });

    client.automodLogger(message, client, `Mensaje con ${reason}`, `Ha sido muteado por enviar ${reason}`);
}

/**
 * Maneja los enlaces de invitación de Discord.
 */
export async function handleDiscordInvite(
    message: Message,
    content: string,
    inviteRegex: RegExp,
    spamRegex: RegExp,
    client: Client
): Promise<true | false> {
    logger("Ejecutando automod discordinvite");
    const { member } = message;
    if (!member || !content.match(inviteRegex)) return false;

    //  Revisa si es un enlace de regalo (gift)
    if (content.includes("promos.discord.gg")) {
        message.delete();
        member.timeout(null);
        sendDM(message, "No envíes regalos en general, pide sortearlo.");
    }

    //  Revisa si es spam de invitación
    if (content.match(spamRegex)) {
        sendDM(message, ACCOUNT_HACKED_MESSAGE);
        await member.kick("Enviar spam (cuenta hackeada)");
        client.automodLogger(message, client, "Cuenta hackeada", "Ha sido kickeado por enviar spam.");
    }

    //  Si no es ninguna de las anteriores, mutea al usuario
    muteUser(message, client, "una Discord invite");
    return true
}

/**
 * Maneja los mensajes de estafa (scam).
 */
export async function handleAntiScam(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<true | false> {
    logger("Ejecutando automod antiScam");
    const { member } = message;
    if (!member || !content.match(regex)) return false;

    sendDM(message, ACCOUNT_HACKED_MESSAGE);
    message.member?.kick("Enviar scam");
    client.automodLogger(message, client, "Cuenta hackeada", "Ha sido kickeado por enviar scam.");
    return true
}

/**
 * Maneja los enlaces de Telegram y WhatsApp.
 */
export async function handleTelegramAndWhatsapp(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<true | false> {
    logger("Ejecutando automod handleTelegramAndWhatsapp");
    const { member } = message;
    if (!member || !content.match(regex)) return false;

    muteUser(message, client, "un grupo de WhatsApp o Telegram");
    return true
}

/**
 * Maneja los mensajes relacionados con 'Nicolás Maduro' para un servidor específico.
 */
export async function handleNicolasMaduro(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<true | false> {
    logger("Ejecutando automod nicolasMaduro");
    const { member, guild } = message;

    //  Solo aplica en un servidor específico
    if (guild?.id !== "813538324320092161" || !member || !content.match(regex)) {
        return false;
    }

    //  Verifica si el usuario tiene roles de rango 5 o 10
    const roleFive = "813546760152547348";
    const roleTen = "813545491957940244";
    if (member.roles.cache.has(roleFive) || member.roles.cache.has(roleTen)) {
        return false;
    }

    await member.ban({ reason: "decir viva maduro 😠" });
    client.automodLogger(
        message,
        client,
        "Incitación al desorden",
        "Ha sido baneado por decir viva maduro."
    );
    return true
}

export async function handleImageScam(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<true | false> {
    const { member, guild, channel } = message;
    logger("ejecutando handleimagescam")
    //  Validaciones iniciales para ignorar mensajes que no cumplen los requisitos
    if (!member || !guild || !(channel instanceof TextChannel) || !message.embeds[0]) {
        return false;
    }


    const attachmentUrls = content.match(regex)
    // Verificar si el mensaje tiene 4 o más archivos adjuntos
    if (attachmentUrls && attachmentUrls.length == 4) {
        await member.timeout(7 * 24 * 60 * 60 * 1000)
        const mutedRole = guild.roles.cache.find((role) => role.name === "Muted");
        if (!mutedRole) {
            throw new Error("El rol 'Muted' no se ha encontrado.");
        }

        await member.roles
            .add(mutedRole, `Enviar 4 links sospechosos, posiblemente spam`)
        member.timeout(null);
        client.automodLogger(message, client, 'muteado por spam', `Enviar 4 links sospechosos, posiblemente spam`);
        return true
    }
    return false
}

export async function handleNoLinksPermissions(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<true | false> {
    const { author, member, guild, channel } = message;
    logger("ejecutando handlenolinkspermissions")
    //  Validaciones iniciales para ignorar mensajes que no cumplen los requisitos
    if (!author || !member || !guild || !(channel instanceof TextChannel) || !message.embeds[0]) {
        return false;
    }
    //  Solo aplica en un servidor específico
    if (guild?.id !== "813538324320092161" || !regex.test(content)) {
        return false;
    }

    const roleFive = "813546760152547348";
    const roleTen = "813545491957940244";
    if (member.roles.cache.has(roleFive) || member.roles.cache.has(roleTen)) {
        return false;
    }

    const bots = await guild.channels.fetch("1112164583344443433")
    if (bots instanceof TextChannel) {
        await bots.send(`Sube al nivel 5 y podrás enviar links e imagenes <@${author.id}>`)
    }
    return true
}
