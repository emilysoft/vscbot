import { Message, TextChannel } from "discord.js"
import Client from "../../../interfaces/ICustomClient.js"
import Iautomod from "../../../interfaces/Iautomod.js"
import sendDM from "../../lib/sendDM.js";
const REGEX_CRYPTO = /(hello|hi|i'll|i will).*(help|teach).*(earn|profit|crypto).*(\d{1,3}k\$?|doubts|the first|\d{1,3} hours).*(crypto|commission|profit)/gim;
const REGEX_DISCORD_INVITE = /(https?:\/\/)?(www\.)?(((discord(app)?)\.com\/invite)|((discord(app)?)\.gg))/gim;
const REGEX_DISCORD_INVITE_SPAM = /(porn|teen|adobe|leaks|onlyfans|giveaway)/gim
const REGEX_STEAM_SCAM = /(gift\s+\d{2}\$|\d{2}\$\s+(gift|(from )?steam))[\s\S]+https/gim
const REGEX_NICOLAS_MADURO = /viva\s+(maduro|chavez)/gim
const HACKED_MESSAGE = "Has sido kickeado/a del servidor porque tu cuenta de Discord has sido hackeada, revisa todos tus dms, borra todos los mensajes de spam que has enviado con tu cuenta, cambia la contraseña, de ser necesario formatea la computadora y regresa de nuevo."
export default {
    name: "automodModeration",
    vscOnly: false,
    ignoreBots: true,
    execute: async function (message: Message, client: Client) {
        try {
            // ignore nit and loq
            if (message.author.id == "690796358579257424") return
            if (message.author.id == "302249242469335060") return
            if (message.channel instanceof TextChannel != true) return
            //consigue el canal automod
            if (/automod/gim.test(message.channel.name)) return
            if (!message.member) return
            if (!message.guild) return

            //vsc - evita staffs
            if (message.guild.id == "813538324320092161") {
                if (message.member.roles.cache.has("813568302294761486"))
                    return message.member.timeout(null);
            }

            const content = message.embeds[0].description;
            if (!content) return
            // por si es un gif de tenor
            if (content.match(/tenor\.com/gim)) return message.member.timeout(null);

            discordInvite(message, content, REGEX_DISCORD_INVITE, client)
            antiScam(message, content, REGEX_CRYPTO, client)
            antiScam(message, content, REGEX_STEAM_SCAM, client)
            nicolasMaduro(message, content, REGEX_NICOLAS_MADURO, client)

        } catch (err: any) {
            if (err.code == 10008) return
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod


async function discordInvite(message: Message, content: string, regex: RegExp, client: Client) {
    if (!message.member) return
    if (!message.guild) return
    if (content.match(regex) == null) return
    // revisa si es un gift
    if (content.match(/promos\.discord\.gg/gim)) {
        await message.delete();
        message.member.timeout(null);
        return sendDM(message, "no envies gift en general, pide sortearlo")
    }
    // por si es spam 
    else if (
        content.match(REGEX_DISCORD_INVITE_SPAM) != null) {
        sendDM(message, HACKED_MESSAGE)

        await message.member.kick("Enviar spam");
        return client.automodLogger(
            message,
            client,
            "Cuenta hackeada",
            "Ha sido kickeado por enviar spam."
        );
    } else {
        // mutear para revisar a fondo en el gulag
        const muted = message.guild.roles.cache.find((role) => role.name === "Muted");
        if (!muted) throw new Error("hubo un error al encontrar el rol pa mutear");

        message.member.roles
            .add(muted, "enviar discord invite")
            .then(() => {
                if (!message.member) return
                if (!message.guild) return
                message.member.timeout(null)
                if (message.guild.id == "813538324320092161") {
                    sendDM(message, "Has sido muteado por enviar una Discord Invite")
                }
            });

        return client.automodLogger(
            message,
            client,
            "Mensaje con discord invite",
            "Ha sido muteado por enviar una Discord invite."
        );
    }

}
async function antiScam(message: Message, content: string, regex: RegExp, client: Client) {
    if (!message.member) return
    if (!message.guild) return
    if (content.match(regex) == null) return
    sendDM(message, HACKED_MESSAGE)
    await message.member.kick("Enviar scam");
    return client.automodLogger(
        message,
        client,
        "Cuenta hackeada",
        "Ha sido kickeado por enviar scam."
    );
}

async function nicolasMaduro(message: Message, content: string, regex: RegExp, client: Client) {
    if (content.match(regex) == null) return
    if (message.guild?.id != "813538324320092161") return
    if (!message.member) return

    let five = message.member.roles.cache.has("813546760152547348")
    let ten = message.member.roles.cache.has("813545491957940244")
    if (five || ten) return
    await message.member.ban({ reason: "decir viva maduro 😠" })
    return client.automodLogger(
        message,
        client,
        "Incitacion al desorden",
        "Ha sido baneado por decir viva maduro"
    );
}