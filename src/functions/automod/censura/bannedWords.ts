import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";

// Lista de ID de usuarios que no serán afectados por el automod.
const IGNORED_USERS = new Set(["302249242469335060", "690796358579257424"]);

// Lista de ID de canales y categorías que no serán afectados.
const IGNORED_CHANNELS_AND_CATEGORIES = new Set([
    "821067797157118013", // mudae
    "1005354020333948988", // basados (duplicado)
    "853387980335874078", // debates
    "813564411628355625", // administracion
    "874730574089187359", // extralaborales
    "1120080747668197436", // registro secundarios
]);

// ID del rol que otorga inmunidad.
const IMMUNITY_ROLE_ID = "1120750038440738868";

type BannedRegexs = {
    raid: RegExp;
    loli: RegExp;
    // Agrega más regex aquí si es necesario
};

const bannedRegexs: BannedRegexs = {
    raid: /\br+[\n\s.\-_]*[4a@aäąàáạ]+[\n\s.\-_]*[iіI1!¡|ïí]+[\n\s.\-_]*(d|ɗ)/gim,
    loli: /\b(l)[\n\s-.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s-.]*(l)+[\n\s-.]*[i!¡|ïí1](s|z)?(((c|k)[\n\s-.]*[oоοօȯọỏơóòö0°\s\n]+[\n\s-.]*n)|\b)/gim
};

export default {
    name: "bannedWords",
    exclusive: true,
    ignoreBots: true,
    execute: async function (message: Message, client: Client) {
        try {
            const { content, channel, author, member } = message;

            // Verificaciones iniciales para salir temprano.
            if (!member || !(channel instanceof TextChannel)) return;
            if (member.roles.cache.has(IMMUNITY_ROLE_ID) || IGNORED_USERS.has(author.id)) return;
            if (IGNORED_CHANNELS_AND_CATEGORIES.has(channel.id) || IGNORED_CHANNELS_AND_CATEGORIES.has(channel.parentId as string)) return;
            if (channel.name.startsWith("ticket")) return;

            for (const regex of Object.values(bannedRegexs)) {
                if (regex.test(content)) {
                    message.delete();
                    member.timeout(60 * 1000, "Palabra bloqueada");

                    // Llama a la función del logger para registrar la situación.
                    client.automodLogger(
                        message,
                        client,
                        "Palabra bloqueada",
                        `<@${author.id}>: ${content}`
                    );
                    break;
                }
            }
        } catch (err: any) {
            if (err.code === 10008) return; // Mensaje ya borrado, no es un error crítico.
            client.errorLogger(err, client, "error", process.cwd());
        }
    }
} as Iautomod;
