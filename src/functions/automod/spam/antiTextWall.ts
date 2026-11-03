import Client from "../../../interfaces/ICustomClient.js";
import Iautomod from "../../../interfaces/Iautomod.js";
import {
  ColorResolvable,
  TextChannel,
  Message,
  EmbedBuilder,
  Role,
  DMChannel,
} from "discord.js";
import config from "../../../config/index.js";
const aviso = `Mensaje borrado por texto excesivo. Usa <#${config.channels.comandos}>`;
import isNumberInMessage from "./../../lib/isNumberInMessage.js";
interface Excepciones {
  outOfContextRoleId: string;
  moderacionRoleId: string;
  SilenciadoRoleId: string;
  mutedRoleId: string;
}
export default {
  name: "antiTextWall",
  ignoreBots: false,
  scope: "guild",
  allowEdited: true,
  execute: async function (message: Message, client: Client) {
    try {
      const limiteCaracteres = 600;
      const excepciones: Excepciones = {
        outOfContextRoleId: config.roles.outOfContext,
        moderacionRoleId: config.roles.moderacion,
        SilenciadoRoleId: config.roles.silenced,
        mutedRoleId: config.roles.muted,
      };
      //EXCEPCIONES
      if (message.channel.isThread()) return; // evitar hilos
      if (
        //evitar bots excepto notsobot
        message.author.bot == true &&
        message.author.id != config.bots.notSoBot
      )
        return;
      if (
        message.author.id == config.users.loq ||
        message.author.id == config.users.nit
      )
        return; //evitar owner
      if (!message.member) return;
      for (const key in excepciones) {
        if (
          message.member.roles.cache.some(
            (role: Role) => role.id === excepciones[key as keyof Excepciones],
          )
        )
          return;
      }
      if (message.channel instanceof TextChannel != true) return;
      if (/^\.\s*dl\s+https/i.test(message.content)) return;
      if (message.channel.parentId === config.categories.administracion) return; //administracion
      if (message.channel.parentId === config.categories.registroPrincipales) return; // registro principales
      if (message.channel.parentId === config.categories.registro) return; // registro secundarios
      if (message.channel.parentId === config.categories.extralaborales) return; //extralaborales
      if (message.channel.id == config.channels.gaming) return; // gaming-y-anime
      if (message.channel.id === config.channels.loqTeAmamos) return; //basados
      if (message.channel.id === config.channels.patas) return; //mudae
      if (message.author.id == config.users.hiraku) return; // hiraku

      if (message.channel.name.startsWith("ticket")) return; //evitar canales de tickets

      //COMPROBACION
      if (message.content.length > 0) {
        // contenido en texto
        const args = message.content;

        // antinewlines
        if (message.author.bot && args.match(/(.*\n){10,}/gm))
          action(message, client, args);
        // antiwalltexts
        if (args.length > limiteCaracteres) action(message, client, args);
      } else if (message.embeds.length > 0) {
        // embeds
        const args = message.embeds[0].description;
        if (args)
          if (args.length > limiteCaracteres) action(message, client, args);
      }
    } catch (err) {
      client.errorLogger(err, client, "error", process.cwd() + " ");
    }
  },
} as Iautomod;

async function action(message: Message, client: Client, args: string) {
  try {
    if (message) await message.delete().catch(() => null);
    const avatarPhoto = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
    if (!client.user) return;
    const botAvatar = client.user.displayAvatarURL();
    const botsChannel = client.channels.cache.find(
      (channel) => channel.id === config.channels.comandos,
    );
    const messageFormated = args.replace(/`/g, "");

    //envia el textWall a bots
    const exampleEmbed = new EmbedBuilder()
      .setColor(config.embedColor as ColorResolvable)
      .setTitle(`Mensaje borrado`)
      .setAuthor({
        name: message.author.username,
        iconURL: avatarPhoto,
      })
      .setDescription(`\`\`\`\n${messageFormated}\`\`\``)
      .setTimestamp()
      .setFooter({
        text: "automod",
        iconURL: botAvatar,
      });

    if (message.author.bot) return;

    //envia aviso del mensaje borrado
    if (message.channel instanceof TextChannel != true) return;
    message.channel.sendTyping();
    message.channel
      .send(`<@${message.author.id}>` + aviso)
      .then(async (msg) => {
        setTimeout(async () => {
          await msg.delete();
        }, 10000);
      });

    // Hace un backup en el dm si esta abierto o en un canal del servidor
    if (!message.member) return;
    message.member.user
      .createDM()
      .then((dm) => {
        dm.send({
          content: `${aviso}`,
          embeds: [exampleEmbed],
        }).catch((err) => {
          // Envia el backup en el canal de bots
          if (err.code == 50007) {
            if (isNumberInMessage(message)) return;
            if (!botsChannel) return;
            if (
              botsChannel instanceof TextChannel != true ||
              botsChannel instanceof DMChannel
            )
              return;
            botsChannel.sendTyping();
            botsChannel.send({
              content: `<@${message.author.id}> ${aviso}`,
              embeds: [exampleEmbed],
            });
          } else client.errorLogger(err, client, "error", process.cwd() + " ");
        });
      })
      .then(() => {
        client.automodLogger(
          message,
          client,
          "Un text wall fue borrado",
          `<@${message.author.id}> pasó un texto excesivo`,
        );
      });

    //logea la situacion
  } catch (err: any) {
    if (err.code == 10008) return;
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
}
