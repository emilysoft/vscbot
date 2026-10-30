import type {
  eventActivities,
  eventParticipants,
  events,
  serverEventConfig,
} from "./schema.js";

// Los tipos se derivan del esquema Drizzle para que no puedan desincronizarse.
export type DB_EventConfig = typeof serverEventConfig.$inferSelect;
export type DB_ScheduledEvent = typeof events.$inferSelect;
export type DB_EventParticipant = typeof eventParticipants.$inferSelect;
export type DB_EventActivity = typeof eventActivities.$inferSelect;
