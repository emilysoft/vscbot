import { Message } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import sendDM from "../lib/sendDM.js";
import logger from "../logger.js";

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
): Promise<void> {
    logger("Ejecutando automod discordinvite");
    const { member } = message;
    if (!member || !content.match(inviteRegex)) return;

    //  Revisa si es un enlace de regalo (gift)
    if (content.includes("promos.discord.gg")) {
        await message.delete();
        member.timeout(null);
        return sendDM(message, "No envíes regalos en general, pide sortearlo.");
    }

    //  Revisa si es spam de invitación
    if (content.match(spamRegex)) {
        sendDM(message, ACCOUNT_HACKED_MESSAGE);
        await member.kick("Enviar spam (cuenta hackeada)");
        return client.automodLogger(message, client, "Cuenta hackeada", "Ha sido kickeado por enviar spam.");
    }

    //  Si no es ninguna de las anteriores, mutea al usuario
    muteUser(message, client, "una Discord invite");
}

/**
 * Maneja los mensajes de estafa (scam).
 */
export async function handleAntiScam(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<void> {
    logger("Ejecutando automod antiScam");
    const { member } = message;
    if (!member || !content.match(regex)) return;

    sendDM(message, ACCOUNT_HACKED_MESSAGE);
    await message.member?.kick("Enviar scam");
    return client.automodLogger(message, client, "Cuenta hackeada", "Ha sido kickeado por enviar scam.");
}

/**
 * Maneja los enlaces de Telegram y WhatsApp.
 */
export async function handleTelegramAndWhatsapp(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<void> {
    const { member } = message;
    if (!member || !content.match(regex)) return;

    muteUser(message, client, "un grupo de WhatsApp o Telegram");
}

/**
 * Maneja los mensajes relacionados con 'Nicolás Maduro' para un servidor específico.
 */
export async function handleNicolasMaduro(
    message: Message,
    content: string,
    regex: RegExp,
    client: Client
): Promise<void> {
    logger("Ejecutando automod nicolasMaduro");
    const { member, guild } = message;

    //  Solo aplica en un servidor específico
    if (guild?.id !== "813538324320092161" || !member || !content.match(regex)) {
        return;
    }

    //  Verifica si el usuario tiene roles de rango 5 o 10
    const roleFive = "813546760152547348";
    const roleTen = "813545491957940244";
    if (member.roles.cache.has(roleFive) || member.roles.cache.has(roleTen)) {
        return;
    }

    await member.ban({ reason: "decir viva maduro 😠" });
    return client.automodLogger(
        message,
        client,
        "Incitación al desorden",
        "Ha sido baneado por decir viva maduro."
    );
}
