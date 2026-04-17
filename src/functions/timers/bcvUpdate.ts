import getBCVdata from "../../functions/lib/getBCVdata.js";
import { TextChannel } from "discord.js";
import errorLogger from "../../functions/loggers/errorLogger.js";
import Client from "../../interfaces/ICustomClient.js";

const TARGET_CHANNEL_ID = "1294633642865332287";
const ROLE_MENTION = "<@&830121766801244160>";

const module = async (now: Date, client: Client) => {
  try {
    const day = now.getDay();

    // Si es sábado (6) o domingo (0), simplemente nos retiramos con elegancia
    if (day === 0 || day === 6) return;

    const hour = now.getHours();
    const minutes = now.getMinutes();

    const channel = client.channels.cache.get(TARGET_CHANNEL_ID);
    if (!(channel instanceof TextChannel)) return;

    const isMorningUpdate = hour === 9 && minutes === 0;
    //const isAfternoonUpdate = hour === 13 && minutes === 35;
    const isFinalUpdate = hour === 17 && minutes === 0;

    if (isMorningUpdate) {
      await sendBcvMessage(client, channel, ROLE_MENTION);
    } else if (isFinalUpdate) {
      await sendBcvMessage(client, channel, "", "Última actualización del día");
    }
  } catch (err) {
    errorLogger(err, client, "error", `${process.cwd()} `);
  }
};

async function sendBcvMessage(
  client: Client,
  channel: TextChannel,
  role = "",
  customContent?: string,
) {
  const embed = await getBCVdata(client);
  if (!embed) return;

  await channel.sendTyping();
  await channel.send({
    content: customContent || `Ya subió el dólar marico! ${role}`,
    embeds: [embed],
  });
}

export default module;
