import { GuildMember, TextChannel } from "discord.js";
import client from "../index-vsc.js";
import config from "../config/config.json" with { type: "json" };

async function handleMutedRoleAdviser(
  oldM: GuildMember,
  newM: GuildMember,
): Promise<void> {
  try {
    const mutedRoleId = config.MUTED_ROLE_ID;
    const adviserChannelId = config.MUTED_ADVISER_CHANNEL_ID;

    if (!mutedRoleId || !adviserChannelId) return;

    const hadMutedRole = oldM.roles.cache.has(mutedRoleId);
    const hasMutedRole = newM.roles.cache.has(mutedRoleId);

    if (hadMutedRole || !hasMutedRole) return;

    const guild = newM.guild;
    const channel =
      guild.channels.cache.get(adviserChannelId) ??
      (await guild.channels.fetch(adviserChannelId).catch(() => null));

    if (!(channel instanceof TextChannel)) return;

    await channel.send(`@silent 🔇 <@${newM.id}> ha sido muteado.`);
  } catch (err) {
    client.errorLogger(err, client, "error");
  }
}

export default handleMutedRoleAdviser
