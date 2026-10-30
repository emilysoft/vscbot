import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "./schema.js";

/**
 * Cliente Drizzle tipado con el esquema completo del bot.
 * Los managers reciben esta instancia (singleton por proceso).
 */
export type AppDatabase = BetterSQLite3Database<typeof schema>;
