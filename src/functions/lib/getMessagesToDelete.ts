import { Message } from "discord.js";
// Esto lo puedes poner en libs
export const getMessagesToDelete = async function (
  message: Message,
): Promise<string[]> {
  const messagesToDelete: string[] = [message.id];

  if (message.reference?.messageId) {
    const repliedMsg = await message.channel.messages
      .fetch(message.reference.messageId)
      .catch(() => null);
    if (repliedMsg) {
      messagesToDelete.push(repliedMsg.id);
    }
  }

  return messagesToDelete;
};
