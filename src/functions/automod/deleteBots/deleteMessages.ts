import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import { deleteBulkMessage } from "../../../functions/lib/deleteBulkMessage.js";
import CONFIGS from "../../../config/config.json" with { type: "json" };

const CONFIG = CONFIGS.DELETE_MESSAGES;
const REGEX = Object.fromEntries(
  Object.entries(CONFIG.REGEX).map(([name, pattern]) => [
    name,
    new RegExp(pattern, "im"),
  ]),
);

const deleteMsgs = {
  noMudae: function (message: Message) {
    if (!(message.author.id == CONFIG.BOTS.GENERAL_CHANNEL.MUDAE)) return;
    const delay = 1000 * 30;
    deleteBulkMessage(message, delay);
  },
  general: {
    // Borra comandos ".dl" | ">dl" | "fm"
    commands: function (message: Message) {
      const { content, author } = message;
      if (author.bot) return;
      const isCommand = Object.values(REGEX).some((regex) =>
        regex.test(content),
      );

      if (!isCommand) return;
      message.delete().catch(() => null);
    },

    // borra bots de general con delay
    BotsFromGeneral: function (message: Message) {
      if (
        Object.values(CONFIG.BOTS.GENERAL_CHANNEL).includes(message.author.id)
      ) {
        const delay = 1000 * 60 * 3;
        deleteBulkMessage(message, delay);
      }
    },

    // Borra mensajes de NSB diciendo que no existe el tag
    unknownTags: function (message: Message) {
      if (!isNSBMessage(message)) return;
      if (REGEX.UNKNOWN_TAG.test(message.content)) {
        const delay = 4000;
        deleteBulkMessage(message, delay);
      }
    },

    // Borra mensajes de NSB que den error
    errorMessage: function (message: Message) {
      if (!isNSBMessage(message)) return;
      const { embeds } = message;
      if (embeds.length > 0 && embeds[0].title?.match(REGEX.COMMNAD_ERROR)) {
        const delay = 4000;
        deleteBulkMessage(message, delay);
      }
    },

    // Borra mensajes de NSB diciendo que el tag está dañado
    deleteEmptyTags: function (message: Message) {
      if (!isNSBMessage(message)) return;
      if (REGEX.EMPTY_TAG.test(message.content)) {
        const delay = 4000;
        deleteBulkMessage(message, delay);
        warnOwner(message);
        return;
      }
    },
  },
};

const isCommandChannelNoThread = (message: Message) =>
  message.channel.id == CONFIG.CHANNELS.COMMAND && !message.channel.isThread();
const isGeneralChannel = (message: Message) =>
  CONFIG.CHANNELS.GENERAL.includes(message.channel.id);
const isNSBMessage = (message: Message) => message.author.id == CONFIG.BOTS.NSB;

interface IHandlers {
  check: (message: Message) => boolean;
  action: ((message: Message) => void | Promise<void>)[];
}

const handlers: IHandlers[] = [
  {
    check: isGeneralChannel,
    action: Object.values(deleteMsgs.general),
  },
  {
    check: isCommandChannelNoThread,
    action: [deleteMsgs.noMudae],
  },
];

export default {
  name: "deleteMessages",
  scope: "guild",
  ignoreBots: false,
  execute: async function (message: Message, client: Client) {
    if (!(message.channel instanceof TextChannel)) return;

    try {
      const handler = handlers.find((h) => h.check(message));
      if (handler) {
        for (const action of handler.action) {
          await action(message);
        }
      }
    } catch (err: any) {
      if (err.code === 10008) return;
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
} as Iautomod;

// Le avisa al owner que un tag ha sido dañado
async function warnOwner({ content, guild }: Message) {
  if (!guild) return;
  const botsChannel = await guild.channels.fetch(CONFIG.CHANNELS.NSB);
  if (!(botsChannel instanceof TextChannel)) return;
  await botsChannel.send(`<@${guild.ownerId}>\n${content}`);
}
