import { Message, TextChannel } from "discord.js";

const REGEX = /^\.\s*t\s+(add|create)/gim;
// Maneja tags de notsobot que no fueron creados debidamente
export async function warningDumpNSBTagCreation(message: Message) {
  if (!(message.channel instanceof TextChannel)) return;
  const { attachments, content, author } = message;
  if (attachments.size == 0) return;
  if (REGEX.test(content)) {
    message.channel.send(
      `<@${author.id}> posiblemente tu tag no se creó bien porque borraste la imagen/video, arregla tu mamada`,
    );
  }
}
