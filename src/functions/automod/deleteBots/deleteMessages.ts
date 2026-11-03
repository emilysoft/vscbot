import { Message, TextChannel } from "discord.js";
import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import { deleteBulkMessage } from "../../../functions/lib/deleteBulkMessage.js";
import CONFIGS, {
  botId,
  channelId,
  channelIds,
  type BotKey,
  type ChannelKey,
} from "../../../config/index.js";

const CONFIG = CONFIGS.deleteMessages;
const GENERAL_CHANNELS = channelIds(CONFIG.channels.general as ChannelKey[]);
const COMMAND_CHANNEL = channelId(CONFIG.channels.command as ChannelKey);
const NSB_CHANNEL = channelId(CONFIG.channels.nsb as ChannelKey);
const NSB_BOT = botId(CONFIG.bots.nsb as BotKey);
const GENERAL_BOTS = Object.values(CONFIG.bots.generalChannel).map((key) =>
  botId(key as BotKey),
);
const MUDAE_BOT = botId(CONFIG.bots.generalChannel.mudae as BotKey);
const REGEX = Object.fromEntries(
  Object.entries(CONFIG.regex).map(([name, pattern]) => [
    name,
    new RegExp(pattern, "im"),
  ]),
);

const deleteMsgs = {
  noMudae: function (message: Message) {
    if (!(message.author.id == MUDAE_BOT)) return;
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
        GENERAL_BOTS.includes(message.author.id)
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
    deleteGeneralErrorTag: function (message: Message) {
      if (!isNSBMessage(message)) return;
      if (REGEX.GENERAL_ERROR_TAG.test(message.content)) {
        const delay = 4000;
        deleteBulkMessage(message, delay);
        return;
      }
    },
  },
};

const isCommandChannelNoThread = (message: Message) =>
  message.channel.id == COMMAND_CHANNEL && !message.channel.isThread();
const isGeneralChannel = (message: Message) =>
  GENERAL_CHANNELS.includes(message.channel.id);
const isNSBMessage = (message: Message) => message.author.id == NSB_BOT;

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
  const botsChannel = await guild.channels.fetch(NSB_CHANNEL);
  if (!(botsChannel instanceof TextChannel)) return;
  await botsChannel.send(`<@${guild.ownerId}>\n${content}`);
}
