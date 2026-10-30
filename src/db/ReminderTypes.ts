import type { reminders } from "./schema.js";

// Derivado del esquema Drizzle: no puede desincronizarse de la tabla.
export type DB_Reminder = typeof reminders.$inferSelect;
