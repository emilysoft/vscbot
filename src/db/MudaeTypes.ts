import type { mudaeActivity, mudaeResetConfig } from "./schema.js";

// Derivados del esquema Drizzle: no pueden desincronizarse de las tablas.
export type DB_MudaeResetConfig = typeof mudaeResetConfig.$inferSelect;
export type DB_MudaeActivity = typeof mudaeActivity.$inferSelect;
