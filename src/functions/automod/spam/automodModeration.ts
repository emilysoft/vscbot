// Imports necesarios para Discord.js y otras utilidades
import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import logger from "../../logger.js";
import {
    handleAntiScam,
    handleDiscordInvite,
    handleImageScam,
    handleNicolasMaduro,
    handleTelegramAndWhatsapp,
    handleNoLinksPermissions
} from "../../lib/automodActions.js";

// ---
//  Expresiones regulares para la detección de patrones maliciosos
// ---

const REGEX_CRYPTO_SCAM = /(hello|hi|i'll|i will).*(help|teach).*(earn|profit|crypto).*(\d{1,3}k\$?|doubts|the first|\d{1,3} hours).*(crypto|commission|profit)/gim;
const REGEX_DISCORD_INVITE = /(https?:\/\/)?(discord(?:app)?\.com\/invite\/|discord\.gg\/)([a-zA-Z0-9-_]+)([^\s\/]*)?/gim;
const REGEX_DISCORD_INVITE_SPAM = /(join|sexcam|babe|porn|teen|adobe|leaks|onlyfans|giveaway)/gim;
const REGEX_STEAM_SCAM = /(gift\s+\d{2}\$|\d{2}\$\s+(gift|(from )?steam))[\s\S]+https/gim;
const REGEX_NICOLAS_MADURO = /viva\s+(maduro|chavez)/gim;
const REGEX_WHATSAPP_TELEGRAM = /https:\/\/((telegram|t)\.me|wa\.me\/\d+)/gim;
const REGEX_IMAGE_SCAM = /^(https:\/\/(media|cdn)\.discordapp\.(net|com)\/attachments\/\d+\/\d+\/(image|\d)\.(jpg|png|jpeg)([\w\W]+)?){4}$/gim
const REGEX_URL = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gim
// ---
//  Configuración del módulo de automoderación
// ---

export default {
    name: "automodModeration",
    scope: "global",
    ignoreBots: true,
    allowEdited: true,
    execute: async function(message: Message, client: Client) {
        try {
            const { member, guild, channel, author } = message;

            //  Validaciones iniciales para ignorar mensajes que no cumplen los requisitos
            if (!member || !guild || !(channel instanceof TextChannel) || !message.embeds[0]) {
                return;
            }

            //  Ignorar usuarios específicos y canales que no sean de automod
            if (
                author.id === "690796358579257424" || //  ID de nit
                author.id === "302249242469335060" || //  ID de loq
                !channel.name.includes("automod")
            ) {
                return;
            }

            //  Manejar casos específicos del servidor "vsc"
            if (guild.id === "813538324320092161") {
                const staffRoleId = "813568302294761486";
                if (member.roles.cache.has(staffRoleId)) {
                    //  Si es staff, no se hace nada y se evita el timeout.
                    return member.timeout(null);
                }
            }

            // agarra el contenido del automod logger de discord
            const content = message.embeds[0].description;
            if (content == null) return
            if (content.length == 0) return

            //  Ignorar GIFs de Tenor, se manejan aparte con un timeout
            if (content.includes("tenor.com")) {
                return member.timeout(null);
            }

            //  Llamadas a las funciones de manejo de contenido malicioso
            if (await handleDiscordInvite(message, content, REGEX_DISCORD_INVITE, REGEX_DISCORD_INVITE_SPAM, client)) return
            if (await handleAntiScam(message, content, REGEX_CRYPTO_SCAM, client)) return
            if (await handleAntiScam(message, content, REGEX_STEAM_SCAM, client)) return
            if (await handleImageScam(message, content, REGEX_IMAGE_SCAM, client)) return
            if (await handleTelegramAndWhatsapp(message, content, REGEX_WHATSAPP_TELEGRAM, client)) return
            if (await handleNicolasMaduro(message, content, REGEX_NICOLAS_MADURO, client)) return
            if (await handleNoLinksPermissions(message, content, REGEX_URL, client)) return
        } catch (err: any) {
            if (err.code === 10008) return; //  Ignorar errores de mensaje no encontrado
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
} as Iautomod;
