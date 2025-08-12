import { TextChannel, GuildMember, Events, Message } from 'discord.js';
import client from "../../index-vsc.js";
import IEvents from "../../interfaces/iEvents.js";

const module: IEvents = {
    name: Events.GuildMemberRemove,
    async execute(member: GuildMember) {
        // IDs de configuración del servidor
        const GUILD_ID = "813538324320092161";
        const WELCOME_CHANNEL_ID = "1345943077470076979";

        // Verifica si el miembro se fue del servidor correcto
        if (member.guild.id !== GUILD_ID) {
            return;
        }

        try {
            const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

            // Verifica si el canal existe y es de texto
            if (!(channel instanceof TextChannel)) {
                console.warn(`El canal de bienvenida con ID ${WELCOME_CHANNEL_ID} no se encontró o no es un canal de texto.`);
                return;
            }

            // Busca los mensajes del usuario que se fue
            const userMessages = (await channel.messages.fetch({ limit: 100 })).filter(
                (message) => message.author.id === member.user.id
            );

            if (userMessages.size === 0) {
                console.log(`No se encontraron mensajes de bienvenida para ${member.user.username}.`);
                return;
            }

            // Filtra y prepara los mensajes para borrar
            const messagesToDelete: Message[] = [];
            const stickerMessages = userMessages.filter(msg =>
                msg.stickers.size > 0 &&
                msg.content === "" &&
                msg.embeds.length === 0 &&
                msg.attachments.size === 0
            );

            for (const stickerMessage of stickerMessages.values()) {
                messagesToDelete.push(stickerMessage);

                // Busca las respuestas a este mensaje
                const replies = userMessages.filter(msg => msg.reference?.messageId === stickerMessage.id);
                messagesToDelete.push(...replies.values());
            }

            // Si hay mensajes para borrar, los elimina
            if (messagesToDelete.length > 0) {
                console.log(`Borrando ${messagesToDelete.length} mensajes de bienvenida y respuestas para ${member.user.username}.`);
                await channel.bulkDelete(messagesToDelete, true);
            }

        } catch (err) {
            console.error(`Ocurrió un error al intentar borrar mensajes de ${member.user.username}:`, err);
            client.errorLogger(err, client, 'error');
        }
    }
};

export default module;
