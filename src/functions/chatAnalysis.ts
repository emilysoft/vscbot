import { TextChannel } from 'discord.js';
import ia from './lib/ia.js';

export async function analyzeChat(channel: TextChannel, limit: number = 50): Promise<string> {
  try {
    // Obtener los últimos mensajes del canal
    const messages = await channel.messages.fetch({ limit });

    // Formatear los mensajes para el prompt
    const formattedMessages = messages
      .map(msg => `${msg.author.username}: ${msg.content}`)
      .reverse()
      .join('\n');

    // Crear el prompt para la IA
    const prompt = `Analiza los siguientes mensajes de un chat de Discord y dime de qué se está hablando. Responde de manera resumida, no expliques el ambiente del chat ni concluyas nada, permitete responder maximo con 600 caracteres:\n\n${formattedMessages}`;

    // Obtener la respuesta de la IA
    const response = await ia(prompt);
    return response;
  } catch (error) {
    console.error('Error al analizar el chat:', error);
    throw new Error('No se pudo analizar el chat en este momento');
  }
} 
