import { Events, GuildMember } from "discord.js"
import wlcStaff from "../../functions/welcome/wlcStaff.js"
import wlcID from "../../functions/welcome/wlcID.js"
import wlcPartnetship from "../../functions/welcome/wlcPartnership.js"
import client from "../../index-vsc.js"
const module = {
  name: Events.GuildMemberAdd,
  async execute(member:GuildMember) {
    wlcStaff(member, client);
    wlcID(member, client);
    wlcPartnetship(member, client);
  },
};
export default module
