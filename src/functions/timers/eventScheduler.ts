import Client from "../../interfaces/ICustomClient.js";
import {
  startEvent,
  endEvent,
  sendReminder,
  cleanupTextChannel,
} from "../scheduledEvents/eventManager.js";

import { DB_ScheduledEvent } from "../../db/EventTypes.js";

const eventTimeouts = new Map<number, NodeJS.Timeout>();

function clearEventTimeout(eventId: number) {
  const existing = eventTimeouts.get(eventId);
  if (existing) {
    clearTimeout(existing);
    eventTimeouts.delete(eventId);
  }
}

function setEventTimeout(
  client: Client,
  eventId: number,
  delayMs: number,
  action: () => Promise<void>,
) {
  clearEventTimeout(eventId);
  const timeout = setTimeout(async () => {
    try {
      await action();
    } catch (err) {
      client.errorLogger(err, client, "error", `${process.cwd()} eventScheduler`);
    } finally {
      if (eventTimeouts.get(eventId) === timeout) {
        eventTimeouts.delete(eventId);
      }
    }
  }, delayMs);
  eventTimeouts.set(eventId, timeout);
}

async function shouldConfirmEvent(client: Client, event: DB_ScheduledEvent): Promise<boolean> {
  if (event.require_confirmation !== null && event.require_confirmation !== undefined) {
    return !!event.require_confirmation;
  }
  const eventConfig = await client.db.events.getConfig(event.server_id);
  return !!eventConfig?.require_confirmation;
}

async function scheduleEventTimeouts(client: Client, eventId: number) {
  try {
    const event = await client.db.events.getEvent(eventId);
    if (!event || !event.id) return;
    const eid = event.id;
    const now = Date.now();

    switch (event.status) {
      case 'scheduled': {
        const startTime = new Date(event.start_time).getTime();
        const reminderTime = startTime - 2 * 60 * 60 * 1000;

        if (!event.reminder_sent && reminderTime > now) {
          const confirm = await shouldConfirmEvent(client, event);
          if (confirm) {
            clearEventTimeout(eid);
            setEventTimeout(client, eid, reminderTime - now, async () => {
              await sendReminder(client, eid);
              await scheduleEventTimeouts(client, eid);
            });
            return;
          }
        }
        if (startTime > now) {
          clearEventTimeout(eid);
          setEventTimeout(client, eid, startTime - now, async () => {
            await startEvent(client, eid);
            const updated = await client.db.events.getEvent(eid);
            if (updated) await scheduleEventTimeouts(client, eid);
          });
          return;
        }
        clearEventTimeout(eid);
        break;
      }
      case 'active': {
        if (event.end_time) {
          const endTime = new Date(event.end_time).getTime();
          if (endTime > now) {
            clearEventTimeout(eid);
            setEventTimeout(client, eid, endTime - now, async () => {
              await endEvent(client, eid);
            });
            return;
          }
        }
        clearEventTimeout(eid);
        break;
      }
      case 'ended': {
        if (event.end_time && event.retention_hours > 0) {
          const retentionEnd = new Date(event.end_time).getTime() + event.retention_hours * 60 * 60 * 1000;
          if (retentionEnd > now) {
            clearEventTimeout(eid);
            setEventTimeout(client, eid, retentionEnd - now, async () => {
              await cleanupTextChannel(client, eid);
            });
            return;
          }
        }
        clearEventTimeout(eid);
        break;
      }
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} eventScheduler/schedule`);
  }
}

export async function cancelScheduledEvent(eventId: number) {
  clearEventTimeout(eventId);
}

export async function rescheduleEvent(client: Client, eventId: number) {
  await scheduleEventTimeouts(client, eventId);
}

async function processAllPending(client: Client) {
  const now = new Date();
  const nowISO = now.toISOString();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  const scheduled = await client.db.events.getEventsByStatus('scheduled');
  for (const event of scheduled) {
    if (!event.id || eventTimeouts.has(event.id)) continue;
    if (event.start_time <= nowISO) {
      await startEvent(client, event.id);
      const updated = await client.db.events.getEvent(event.id);
      if (updated) await scheduleEventTimeouts(client, updated.id!);
    } else if (!event.reminder_sent && event.start_time <= twoHoursLater) {
      const confirm = await shouldConfirmEvent(client, event);
      if (confirm) {
        await sendReminder(client, event.id);
        const updated = await client.db.events.getEvent(event.id);
        if (updated) await scheduleEventTimeouts(client, updated.id!);
      }
    }
  }

  const active = await client.db.events.getEventsByStatus('active');
  for (const event of active) {
    if (!event.id || eventTimeouts.has(event.id)) continue;
    if (event.end_time && event.end_time <= nowISO) {
      await endEvent(client, event.id);
    }
  }

  const endedEvents = await client.db.events.getEventsByStatus('ended');
  for (const event of endedEvents) {
    if (!event.id || eventTimeouts.has(event.id)) continue;
    if (!event.end_time || event.retention_hours <= 0) continue;
    const retentionEnd = new Date(event.end_time);
    retentionEnd.setHours(retentionEnd.getHours() + event.retention_hours);
    if (now >= retentionEnd) {
      await cleanupTextChannel(client, event.id);
    }
  }
}

export async function initScheduler(client: Client) {
  const allStatuses = ['scheduled', 'active', 'ended'];
  for (const status of allStatuses) {
    const events = await client.db.events.getEventsByStatus(status);
    for (const event of events) {
      if (event.id) await scheduleEventTimeouts(client, event.id);
    }
  }

  console.log(`[eventScheduler] Scheduled ${eventTimeouts.size} individual event timeouts`);

  await processAllPending(client);

  setInterval(() => processAllPending(client), 60 * 1000);
}
