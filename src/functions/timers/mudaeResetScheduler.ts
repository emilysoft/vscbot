import Client from "../../interfaces/ICustomClient.js";
import { refreshTrackedChannels, sendReset } from "../mudae/mudaeReset.js";
import { DB_MudaeResetConfig } from "../../db/MudaeTypes.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function isDue(cfg: DB_MudaeResetConfig, now: Date): boolean {
  if (!cfg.last_run_at) return true;
  const lastRun = new Date(cfg.last_run_at).getTime();
  return now.getTime() - lastRun >= cfg.interval_days * DAY_MS;
}

async function processDueResets(client: Client): Promise<void> {
  const now = new Date();
  const configs = await client.db.mudae.getAllEnabled();
  for (const cfg of configs) {
    if (!isDue(cfg, now)) continue;
    try {
      await sendReset(client, cfg, now);
    } catch (err) {
      client.errorLogger(err, client, "error", `${process.cwd()} timers/mudaeResetScheduler`);
    }
  }
}

export async function initMudaeResetScheduler(client: Client): Promise<void> {
  await refreshTrackedChannels(client);
  await processDueResets(client);
  console.log("[mudaeResetScheduler] Inicializado");

  let tickRunning = false;
  setInterval(async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await processDueResets(client);
    } catch (err) {
      console.error("[mudaeResetScheduler] Error en el tick:", err);
    } finally {
      tickRunning = false;
    }
  }, 60 * 1000);

  setInterval(() => refreshTrackedChannels(client), 5 * 60 * 1000);
}