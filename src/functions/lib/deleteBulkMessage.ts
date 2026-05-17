import { TextChannel, Message } from "discord.js";
import { getMessagesToDelete } from "./getMessagesToDelete.js";

export const deleteBulkMessage = async function (message: Message, delay = 0) {
  const messagesToDelete = await getMessagesToDelete(message);
  if (
    messagesToDelete.length === 0 ||
    !(message.channel instanceof TextChannel)
  )
    return;

  if (delay === 0) {
    await message.channel.bulkDelete(messagesToDelete).catch(() => null);
    return;
  }

  setTimeout(async () => {
    if (message.channel instanceof TextChannel) {
      await message.channel.bulkDelete(messagesToDelete).catch(() => null);
    }
  }, delay);
};
