import { Events } from "discord.js"
import wlcStaff from "../../functions/welcome/wlcStaff.js"
import wlcID from "../../functions/welcome/wlcID.js"
import wlcPartnetship from "../../functions/welcome/wlcPartnership.js"
const module = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        wlcStaff(member);
        wlcID(member);
        wlcPartnetship(member);
    },
};
export default module
