import { TextChannel, Message } from "discord.js";
import ICommand from "../../interfaces/command.js";
import Client from "../../interfaces/ICustomClient.js";
const TCG_API_KEY = process.env.TCG_API_KEY;
const UNKHOWN_MESSAGE = 10008;
const channelsAllowed = [
  "1024260771326197781",
  "813564359874838558",
  "1172695535468150814",
];
import { SlashCommandBuilder } from "discord.js";
const module: ICommand = {
  name: "tcg",
  data: new SlashCommandBuilder()
    .setName("tcg")
    .setDescription("Busca una carta ctg"),
  description: "Busca una carta ctg",
  cooldown: 5,
  messageCommand: true,
  allowEdited: false,
  slashCommand: false,
  async run(message: Message, client: Client) {
    geldooru(message, client);
  },
};

async function geldooru(message: Message, client: Client) {
  const myHeaders = new Headers();
  if (!TCG_API_KEY) throw new Error("TCG_API_KEY no found");
  myHeaders.append("X-Api-Key", TCG_API_KEY);
  try {
    const { channel } = message;
    if (!channel) return;
    if (channel instanceof TextChannel) {
      channel.sendTyping();
      const query = message.content
        .split(" ")
        .slice(1)
        .join(" ")
        .replace(/\s+/g, " ")
        .replace(/\s/g, "%20");
      if (!query) return message.reply("especifique algo");
      const shit = await fetch(
        `https://api.pokemontcg.io/v1/cards?name=${query}`,
        { headers: myHeaders },
      ).then((res) => res.json());
      //if(!shit.ok) return message.reply("no conseguido")

      if (shit?.cards == undefined) return message.reply("no conseguido");
      message.reply({
        content:
          shit.cards[Math.floor(Math.random() * shit.cards.length)]
            .imageUrlHiRes,
        allowedMentions: {
          repliedUser: false,
        },
      });
    }
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
}

export default module;
