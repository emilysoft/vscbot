import Client from "../../interfaces/ICustomClient.js";
import { startEvent, endEvent, sendReminder, cleanupTextChannel } from "../events/eventManager.js";

const module = async (now: Date, client: Client) => {
  try {
    const nowISO = now.toISOString();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const scheduled = await client.db.events.getEventsByStatus('scheduled');
    for (const event of scheduled) {
      if (!event.id) continue;
      if (event.start_time <= nowISO) {
        await startEvent(client, event.id);
      } else if (!event.reminder_sent && event.start_time <= twoHoursLater) {
        await sendReminder(client, event.id);
      }
    }

    const active = await client.db.events.getEventsByStatus('active');
    for (const event of active) {
      if (event.id && event.end_time && event.end_time <= nowISO) {
        await endEvent(client, event.id);
      }
    }

    const endedEvents = await client.db.events.getEventsByStatus('ended');
    for (const event of endedEvents) {
      if (!event.id || !event.end_time || event.retention_hours <= 0) continue;
      const retentionEnd = new Date(event.end_time);
      retentionEnd.setHours(retentionEnd.getHours() + event.retention_hours);
      if (now >= retentionEnd) {
        await cleanupTextChannel(client, event.id);
      }
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} `);
  }
};

export default module;
