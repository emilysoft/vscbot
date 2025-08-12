// Imports necesarios para Discord.js y otras utilidades
import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import logger from "../../logger.js";
import {
    handleAntiScam,
    handleDiscordInvite,
    handleNicolasMaduro,
    handleTelegramAndWhatsapp,
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

// ---
//  Configuración del módulo de automoderación
// ---

export default {
    name: "automodModeration",
    vscOnly: false,
    ignoreBots: true,
    allowEdited: true,
    execute: async function (message: Message, client: Client) {
        try {
            logger(`Ejecutando automod: ${this.name}`);

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

            const content = message.embeds[0].description;
            if (!content) {
                return;
            }

            //  Ignorar GIFs de Tenor, se manejan aparte con un timeout
            if (content.includes("tenor.com")) {
                return member.timeout(null);
            }

            //  Llamadas a las funciones de manejo de contenido malicioso
            handleDiscordInvite(message, content, REGEX_DISCORD_INVITE, REGEX_DISCORD_INVITE_SPAM, client);
            handleAntiScam(message, content, REGEX_CRYPTO_SCAM, client);
            handleAntiScam(message, content, REGEX_STEAM_SCAM, client);
            handleTelegramAndWhatsapp(message, content, REGEX_WHATSAPP_TELEGRAM, client);
            handleNicolasMaduro(message, content, REGEX_NICOLAS_MADURO, client);
        } catch (err: any) {
            if (err.code === 10008) return; //  Ignorar errores de mensaje no encontrado
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    },
} as Iautomod;
