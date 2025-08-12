import { Message, TextChannel } from 'discord.js';
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import logger from "../../logger.js";
import { createWorker } from 'tesseract.js';
import { downloadFromURL, getBufferFromURL } from '../../lib/download.js';
// Palabras que quieres detectar en las imágenes
const spamWords = ['gracewex']; // Reemplaza con tus palabras clave
const REGEX_LINK = /https:\/\/(media|cdn)\.discordapp\.(net|com)\/attachments\/\d+\/\d+\/\d\.(jpg|png|jpeg)/gim
export default {
    name: "antiImageSpam",
    vscOnly: false,
    ignoreBots: true,
    allowEdited: false,
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
                author.id === "302249242469335060"  //  ID de loq
            ) {
                return;
            }

            const attachmentUrls = message.content.match(REGEX_LINK)
            // Verificar si el mensaje tiene 4 o más archivos adjuntos
            console.log(attachmentUrls)
            if (attachmentUrls && attachmentUrls.length == 4) {
                await member.timeout(7 * 24 * 60 * 60 * 1000)
                const mutedRole = guild.roles.cache.find((role) => role.name === "Muted");
                if (!mutedRole) {
                    throw new Error("El rol 'Muted' no se ha encontrado.");
                }

                member.roles
                    .add(mutedRole, `Enviar 4 links sospechosos, posiblemente spam`)
                    .then(() => {
                        member.timeout(null);
                    })

                return client.automodLogger(message, client, 'muteado por spam', `Enviar 4 links sospechosos, posiblemente spam`);

                //let spamCount = 0;

                //logger(`Ejecutando automod: ${this.name}`);
                //// Analizar cada imagen
                //for (const url of attachmentUrls) {

                //    //const downloadFromURL = async (url: string, format: string, name: string) => {
                //    let name = url.split(".")[2].split("/").pop() || message.id
                //    const buffer = await getBufferFromURL(url, name)
                //    if (!buffer) continue
                //    const imageText = await analyzeImage(buffer);

                //    // Convertir el texto a minúsculas para una comparación sin distinción de mayúsculas
                //    const lowerCaseText = imageText.toLowerCase();

                //    // Verificar si el texto de la imagen contiene alguna de las palabras de spam
                //    if (spamWords.some(word => lowerCaseText.includes(word))) {
                //        spamCount++;
                //    }
                //}

                //if (spamCount > 0) {
                //    if (message.member) {
                //        await message.member.ban({ reason: 'Imagenes con scam' });
                //    }

                //    await message.delete();
                //    return client.automodLogger(message, client, "spam account", "Ha sido baneado por enviar scam.");
            }
        }
        catch (err: any) {
            if (err.code === 10008) return; //  Ignorar errores de mensaje no encontrado
            client.errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
} as Iautomod;


// Función para analizar la imagen y detectar texto
async function analyzeImage(buffer: Buffer): Promise<string> {
    try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(buffer);
        worker.terminate()
        return ret.data.text;
    } catch (error) {
        console.error('Error al analizar la imagen:', error);
        return '';
    }
}

