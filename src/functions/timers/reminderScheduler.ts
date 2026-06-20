import { TextChannel } from "discord.js";
import { DateTime } from "luxon";
import Client from "../../interfaces/ICustomClient.js";

const reminderTimeouts = new Map<number, NodeJS.Timeout>();

function clearReminderTimeout(reminderId: number) {
  const existing = reminderTimeouts.get(reminderId);
  if (existing) {
    clearTimeout(existing);
    reminderTimeouts.delete(reminderId);
  }
}

async function sendReminderMessage(client: Client, reminderId: number) {
  try {
    const reminder = await client.db.reminders.get(reminderId);
    if (!reminder || reminder.status !== 'pending') return;

    const guild = client.guilds.cache.get(reminder.server_id);
    if (!guild) return;

    const channel = guild.channels.cache.get(reminder.channel_id) as TextChannel | undefined;
    if (!channel) return;

    await channel.send(reminder.message);

    if (reminder.recurring) {
      const nextTime = DateTime.fromISO(reminder.remind_at).plus({ days: 1 });
      const now = DateTime.now();
      let target = nextTime.set({ second: 0, millisecond: 0 });
      if (target <= now) {
        target = target.plus({ days: 1 });
      }
      await client.db.reminders.update(reminderId, { remind_at: target.toISO()! });
      await scheduleReminderTimeout(client, reminderId);
    } else {
      await client.db.reminders.markSent(reminderId);
    }
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} timers/reminderScheduler`);
  }
}

async function scheduleReminderTimeout(client: Client, reminderId: number) {
  try {
    const reminder = await client.db.reminders.get(reminderId);
    if (!reminder || reminder.status !== 'pending') return;

    const remindAt = new Date(reminder.remind_at).getTime();
    const now = Date.now();
    const delay = remindAt - now;

    if (delay <= 0) {
      await sendReminderMessage(client, reminderId);
      return;
    }

    clearReminderTimeout(reminderId);
    const timeout = setTimeout(async () => {
      await sendReminderMessage(client, reminderId);
      reminderTimeouts.delete(reminderId);
    }, delay);
    reminderTimeouts.set(reminderId, timeout);
  } catch (err) {
    client.errorLogger(err, client, "error", `${process.cwd()} timers/reminderScheduler/schedule`);
  }
}

export async function cancelReminder(reminderId: number) {
  clearReminderTimeout(reminderId);
}

export async function rescheduleReminder(client: Client, reminderId: number) {
  await scheduleReminderTimeout(client, reminderId);
}

async function processPastDue(client: Client) {
  const now = new Date().toISOString();
  const pending = await client.db.reminders.getPendingBefore(now);
  for (const reminder of pending) {
    if (reminder.id) await sendReminderMessage(client, reminder.id);
  }
}

export async function initReminderScheduler(client: Client) {
  const pending = await client.db.reminders.getByStatus('pending');
  for (const reminder of pending) {
    if (reminder.id) await scheduleReminderTimeout(client, reminder.id);
  }

  await processPastDue(client);

  console.log(`[reminderScheduler] Scheduled ${reminderTimeouts.size} reminder timeouts`);

  setInterval(() => processPastDue(client), 60 * 1000);
}
