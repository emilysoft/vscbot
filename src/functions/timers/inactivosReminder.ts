import Client from "../../interfaces/ICustomClient.js"
import { TextChannel } from "discord.js";
import config from "../../config/index.js";
const canal_inactivos = config.channels.inactive;
const canal_noVerificados = config.channels.verificate;
const inactivo = `<@&${config.roles.inactive}>`;
const noVerificado = `<@&${config.roles.unverified}>`;
const module = async (now: Date, client:Client) => {
  try {
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const channel = client.channels.cache.find(
      (c) => c.id === canal_inactivos
    );
    const channel2 = client.channels.cache.find(
      (c) => c.id === canal_noVerificados
    );
    if(channel instanceof TextChannel != true) return
    if(channel2 instanceof TextChannel != true) return
    if (hour == 8 && minutes == 0) {
      channel
        .send(inactivo + " Ups, parece que te has quedado dormido/a")
        .then(async (msg) => await msg.delete());
      channel2
        .send(
          noVerificado +
            " No olvides verificar tu cuenta para entrar al servidor"
        )
        .then(async (msg) => await msg.delete());
    }
  } catch (err) {
    client.errorLogger(err, client, "error", process.cwd() + " ");
  }
};
export default module 
