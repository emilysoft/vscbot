import fs from 'fs';
import path from 'path';

// Interfaz para almacenar mensajes de usuarios
interface UserMessages {
    [userId: string]: string[];
}

class CarlosBot {
    private userMessages: UserMessages = {};
    private readonly logsPath: string = './chat_logs';
    private readonly triggerName: string = 'carlos';

    constructor() {
        this.loadUserMessages();
    }

    // Cargar mensajes históricos de los logs
    private loadUserMessages(): void {
        // Implementar lectura de logs
    }

    // Añadir nuevos mensajes al almacenamiento
    public addUserMessage(userId: string, message: string): void {
        if (!this.userMessages[userId]) {
            this.userMessages[userId] = []
        }
        this.userMessages[userId].push(message);

        // Opcional: guardar en logs
        this.saveToLog(userId, message);
    }

    // Procesar una pregunta para Carlos
    public respondAsCarlos(question: string): string {
        // 1. Extraer palabras clave de la pregunta
        const keywords = this.extractKeywords(question);

        // 2. Buscar mensajes relevantes en el historial
        const relevantMessages = this.findRelevantMessages(keywords);

        // 3. Seleccionar o construir una respuesta
        return this.buildResponse(relevantMessages, question);
    }

    // Extraer palabras clave usando expresiones regulares
    private extractKeywords(text: string): string[] {
        // Eliminar signos de puntuación y palabras comunes
        const cleaned = text.toLowerCase()
            .replace(/[^\w\sáéíóúüñ]/g, '')
            .replace(/\b(el|la|los|las|un|una|unos|unas|de|que|y|a|en|con|por|para|como)\b/g, '');

        // Extraer palabras únicas
        const words = cleaned.split(/\s+/).filter(word => word.length > 3);
        return [...new Set(words)]; // Eliminar duplicados
    }

    // Buscar mensajes relevantes en el historial
    private findRelevantMessages(keywords: string[]): string[] {
        const relevant: string[] = [];

        for (const userId in this.userMessages) {
            for (const message of this.userMessages[userId]) {
                const lowerMessage = message.toLowerCase();

                // Verificar si el mensaje contiene alguna palabra clave
                if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                    relevant.push(message);
                }
            }
        }

        return relevant;
    }

    // Construir una respuesta coherente
    private buildResponse(relevantMessages: string[], question: string): string {
        if (relevantMessages.length === 0) {
            return this.getRandomFallback();
        }

        // Estrategia 1: Usar el mensaje más reciente que contenga la mayoría de palabras clave
        const scoredMessages = relevantMessages.map(msg => ({
            message: msg,
            score: this.countKeywordsInMessage(msg, this.extractKeywords(question))
        }));

        scoredMessages.sort((a, b) => b.score - a.score);

        // Estrategia 2: Combinar partes de mensajes relevantes
        if (scoredMessages[0].score > 0) {
            const bestMessage = scoredMessages[0].message;
            return this.adaptMessageToQuestion(bestMessage, question);
        }

        // Estrategia 3: Respuesta aleatoria si no hay coincidencias fuertes
        return this.getRandomResponse(relevantMessages);
    }

    // Adaptar un mensaje existente a la pregunta
    private adaptMessageToQuestion(message: string, question: string): string {
        // Implementar lógica para modificar el mensaje según la pregunta
        // Por ejemplo, cambiar pronombres o conjugaciones verbales

        // Versión simple: devolver el mensaje tal cual
        return message;
    }

    // Respuestas aleatorias cuando no hay coincidencias
    private getRandomFallback(): string {
        const fallbacks = [
            "No estoy seguro de qué decir sobre eso.",
            "Interesante, ¿qué más quieres saber?",
            "No recuerdo haber hablado de eso antes.",
            "¿Puedes explicarme más sobre lo que preguntas?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    private getRandomResponse(messages: string[]): string {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    private countKeywordsInMessage(message: string, keywords: string[]): number {
        const lowerMessage = message.toLowerCase();
        return keywords.filter(keyword => lowerMessage.includes(keyword)).length;
    }

    private saveToLog(userId: string, message: string): void {
        // Implementar guardado en archivo de log
    }
}

export default CarlosBot;