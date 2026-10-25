import { AuditLogEvent, Events, Guild, GuildAuditLogsEntry } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import IEvents from "../../interfaces/iEvents.js";
import { logStaffMessageDelete } from "../../functions/loggers/staffMessageDeleteLogger.js";

const module: IEvents = {
  name: Events.GuildAuditLogEntryCreate,
  async execute(entry: GuildAuditLogsEntry, guild: Guild) {
    if (entry.action !== AuditLogEvent.MessageDelete) return;
    if (guild.id !== process.env.MAIN_SERVER) return;

    const client = guild.client as Client;

    try {
      await logStaffMessageDelete(
        entry as GuildAuditLogsEntry<AuditLogEvent.MessageDelete>,
        guild,
      );
    } catch (err) {
      client.errorLogger(
        err,
        client,
        "error",
        `${process.cwd()} events/guild/guildAuditLogEntryCreate`,
      );
    }
  },
};

export default module;
