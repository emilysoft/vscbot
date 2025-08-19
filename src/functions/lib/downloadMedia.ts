import { Message, TextChannel } from "discord.js";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import { instagramGetUrl } from "instagram-url-direct";
import { downloadFromURL, clearDownload } from "../../functions/lib/download.js"; // Asegúrate de que esta ruta sea correcta.
import yt_dlp from "../../functions/lib/yt-dlp-api.js"
const UNKNOWN_MESSAGE_ERROR_CODE = 10008;

class VideoDownloader {
    private message: Message;
    private isCommandContext: boolean; // Indica si la descarga se inició desde un comando explícito

    constructor(message: Message, isCommandContext: boolean = true) {
        this.message = message;
        this.isCommandContext = isCommandContext;
    }

    /**
     * Helper privado para manejar el envío de mensajes de error y eliminación automática.
     * @param content El contenido del mensaje de error.
     * @param originalMessageToDelete Indica si el mensaje original del usuario debe ser borrado.
     */
    private async sendTemporaryErrorMessage(content: string, originalMessageToDelete: boolean = false): Promise<void> {
        if (!(this.message.channel instanceof TextChannel)) return; // Asegura que estemos en un canal de texto

        try {
            const sentMessage = await this.message.reply(content);
            setTimeout(() => {
                sentMessage.delete().catch(err => console.error("Error al eliminar mensaje de error temporal:", err));
                if (originalMessageToDelete) {
                    this.message.delete().catch(err => console.error("Error al eliminar mensaje original:", err));
                }
            }, 3000);
        } catch (err: any) {
            // Si el mensaje original fue borrado (UNKNOWN_MESSAGE_ERROR_CODE), intenta enviar al canal directamente.
            if (err.code === UNKNOWN_MESSAGE_ERROR_CODE || err.code === 50035) {
                if (this.message.channel instanceof TextChannel) {
                    this.message.channel.send(content)
                        .then(msg => setTimeout(() => msg.delete().catch(deleteErr => console.error("Error al eliminar mensaje de error directo:", deleteErr)), 3000))
                        .catch(finalErr => console.error("Error al enviar mensaje de error al canal directamente:", finalErr));
                }
            } else {
                console.error("Error inesperado al enviar mensaje de error:", err);
            }
        }
    }

    /**
     * Helper privado para enviar el archivo y limpiar después.
     * @param filePath La ruta del archivo a enviar.
     */
    private async sendFileAndClean(filePath: string): Promise<void> {
        if (!(this.message.channel instanceof TextChannel)) {
            clearDownload(filePath); // Limpiar si no podemos enviar
            return;
        }

        const fileAttachment = { files: [filePath] };
        try {
            await this.message.reply(fileAttachment);
            clearDownload(filePath); // Limpiar después de enviar
        } catch (err: any) {
            // Si el mensaje original fue borrado, intenta enviar directamente al canal.
            if (err.code === UNKNOWN_MESSAGE_ERROR_CODE || err.code === 50035) {
                if (this.message.channel instanceof TextChannel) {
                    await this.message.channel.send(fileAttachment);
                    clearDownload(filePath);
                }
            } else {
                console.error("Error al enviar el video o limpiar:", err);
                this.sendTemporaryErrorMessage("No pude enviar el video. Intenta de nuevo más tarde.", false);
                clearDownload(filePath); // Asegurarse de limpiar incluso si falla el envío.
            }
        }
    }

    /**
     * Descarga un video de Facebook y lo envía al canal de Discord.
     * @param link El enlace del video de Facebook.
     */
    public async downloadFacebookVideo(link: string): Promise<void> {
        try {
            const result = await getFbVideoInfo(link);
            if (!result || !result.hd) {
                this.sendTemporaryErrorMessage("No pude obtener la información del video de Facebook o no encontré una calidad HD.");
                return;
            }

            const attachPath = await downloadFromURL(result.hd, "mp4", this.message.id);
            if (!attachPath) {
                this.sendTemporaryErrorMessage("No pude descargar ese video de Facebook. ¡Intenta con otro!");
                return;
            }
            await this.sendFileAndClean(attachPath);

        } catch (err: any) {
            console.error("Error al procesar descarga de Facebook:", err);
            if (this.isCommandContext) { // Solo si fue un comando explícito, envia el mensaje de error al usuario
                this.sendTemporaryErrorMessage(`Hubo un error al descargar el video de Facebook: ${err.message || 'Error desconocido'}.`, true);
            }
        }
    }

    /**
     * Descarga un video/reels de Instagram y lo envía al canal de Discord.
     * @param link El enlace del video de Instagram.
     */
    public async downloadInstagramVideo(link: string): Promise<void> {
        try {
            const result = await instagramGetUrl(link);
            if (!result || !result.url_list || result.url_list.length === 0) {
                this.sendTemporaryErrorMessage("No pude obtener la URL del video de Instagram.");
                return;
            }

            // Asumiendo que el primer elemento es el video principal o el de mejor calidad
            const attachPath = await downloadFromURL(result.url_list[0], "mp4", this.message.id);
            if (!attachPath) {
                this.sendTemporaryErrorMessage("Hubo un error al descargar el video de Instagram. ¡Revisa el enlace!");
                return;
            }
            await this.sendFileAndClean(attachPath);

        } catch (err: any) {
            console.error("Error al procesar descarga de Instagram:", err);
            // Siempre notificar para Instagram, ya que generalmente es una acción directa del usuario.
            this.sendTemporaryErrorMessage(`Hubo un error al descargar el video de Instagram: ${err.message || 'Error desconocido'}.`, true);
        }
    }

    public async downloadYouTubeVideo(link: string): Promise<void> {
        try {
            const download = new yt_dlp(link);
            const result = await download.StartDownload()
            if (!result || !result.filePath) {
                this.sendTemporaryErrorMessage("No pude obtener la información del video de YouTube o no encontré una calidad HD.");
                return;
            }

            await this.sendFileAndClean(result.filePath);

        } catch (err: any) {
            console.error("Error al procesar descarga de YouTube:", err);
            if (this.isCommandContext) { // Solo si fue un comando explícito, envia el mensaje de error al usuario
                this.sendTemporaryErrorMessage(`Hubo un error al descargar el video de YouTube: ${err.message || 'Error desconocido'}.`, true);
            }
        }
    }
}

export default VideoDownloader;
