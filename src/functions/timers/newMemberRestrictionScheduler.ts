import Client from "../../interfaces/ICustomClient.js";

async function checkExpired(client: Client) {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const expired = await client.db.newMemberRestrictions.getPendingExpired(sixHoursAgo);

    for (const record of expired) {
      const guild = client.guilds.cache.get(record.server_id);
      if (!guild) {
        await client.db.newMemberRestrictions.markRemoved(record.id!);
        continue;
      }

      try {
        const member = await guild.members.fetch(record.user_id);
        if (member.roles.cache.has(record.role_id)) {
          await member.roles.remove(record.role_id);
        }
        await client.db.newMemberRestrictions.markRemoved(record.id!);
      } catch {
        await client.db.newMemberRestrictions.markRemoved(record.id!);
      }
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} timers/newMemberRestrictionScheduler`);
  }
}

export async function initNewMemberRestrictionScheduler(client: Client) {
  await checkExpired(client);
  console.log("[newMemberRestrictionScheduler] Initial check complete");
  setInterval(() => checkExpired(client), 60 * 1000);
}
