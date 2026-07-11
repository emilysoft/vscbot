import { Events, GuildMember } from "discord.js"
import wlcStaff from "../../functions/welcome/wlcStaff.js"
import wlcID from "../../functions/welcome/wlcID.js"
import wlcPartnetship from "../../functions/welcome/wlcPartnership.js"
import LevelSystem from "../../functions/levels/levelSystem.js"
import Client from "../../interfaces/ICustomClient.js"
import config from "../../config/config.json" with { type: "json" }
import { DB_UserLevel } from "../../db/Idatabase.js"

const module = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    const client = member.client as Client;
    wlcStaff(member, client);
    wlcID(member, client);
    wlcPartnetship(member, client);

    if (member.user.bot) return;

    const levelDB = await client.db.levels.get(member.user, member.guild) as DB_UserLevel | undefined;
    if (levelDB) {
      await LevelSystem.syncRewardRoles(member, levelDB.level, client);
    }

    const roleId = config.NEW_MEMBER_VC_ROLE_ID;
    if (!roleId) return;

    try {
      const role = member.guild.roles.cache.get(roleId);
      if (!role) return;

      await member.roles.add(role);

      await client.db.newMemberRestrictions.create({
        user_id: member.id,
        server_id: member.guild.id,
        role_id: roleId,
        assigned_at: new Date().toISOString(),
        status: "pending",
      });
    } catch (err) {
      client.errorLogger(err, client, "error", `${process.cwd()} events/guild/guildMemberAdd`);
    }
  },
};
export default module
