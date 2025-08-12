const API_URL = "http://localhost:3005/api/download";

interface DownloadResponse {
    message: string;
    filePath?: string;
    dowloadUrl?: string;
    error?: string;
}

class DownloadVideo {
    private readonly url: string;

    constructor(url: string) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            throw new Error("Se debe proporcionar una URL válida para descargar el video.");
        }
        this.url = url;
    }

    /**
     * Realiza la solicitud a la API para iniciar la descarga del video.
     * @returns Una promesa que resuelve con los datos de la respuesta de la API o lanza un error si la descarga falla.
     */
    public async downloadVideo(): Promise<DownloadResponse> {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: this.url })
            });

            // Verifica si la respuesta HTTP fue exitosa (código 2xx).
            if (!response.ok) {
                let errorData: any;
                try {
                    errorData = await response.json(); // Intenta parsear el error del cuerpo si está disponible
                } catch (parseError) {
                    errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
                }
                // Lanza un error más descriptivo.
                throw new Error(`Fallo la descarga del video: ${errorData.message || response.statusText}`);
            }

            // Parsea la respuesta JSON.
            const data: DownloadResponse = await response.json();
            return data;

        } catch (error) {
            // Captura cualquier error de red o de la API y lo relanza para que sea manejado por el llamador.
            console.error("Error al intentar descargar el video:", error);
            throw new Error(`No se pudo completar la descarga del video: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Inicia el proceso de descarga y maneja la promesa resultante.
     * Este método es más bien un punto de entrada para el usuario.
     */
    public async StartDownload(): Promise<DownloadResponse> {
        try {
            console.log(`Iniciando descarga para la URL: ${this.url}`);
            const result = await this.downloadVideo();
            console.log("Descarga completada exitosamente:", result);
            return result;
        } catch (error) {
            console.error("Hubo un problema al iniciar la descarga:", error);
            // Aquí podrías mostrar un mensaje al usuario, registrar el error, etc.
            // Puedes relanzar el error si quieres que el llamador también lo maneje.
            throw error;
        }
    }
}

export default DownloadVideo;
