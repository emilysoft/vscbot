import { Events, GuildMember } from "discord.js";
import client from "../../index-vsc.js";
import IEvents from "../../interfaces/iEvents.js";
import handleWelcomeMessages from "../../functions/lib/verificacionAdviser.js";
import handleMutedRoleAdviser from "../../functions/handleMutedRoleAdviser.js";

const module: IEvents = {
  name: Events.GuildMemberUpdate,
  async execute(oldM: GuildMember, newM: GuildMember) {
    try {
      await handleWelcomeMessages(oldM, newM);
      await handleMutedRoleAdviser(oldM, newM);
    } catch (err) {
      client.errorLogger(err, client, "error");
    }
  },
};
export default module;
