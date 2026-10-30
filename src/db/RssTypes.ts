import type { rssFeeds } from "./schema.js";

// Derivado del esquema Drizzle: no puede desincronizarse de la tabla.
export type DB_RssFeed = typeof rssFeeds.$inferSelect;
