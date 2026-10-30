import type { newMemberRestrictions } from "./schema.js";

// Derivado del esquema Drizzle: no puede desincronizarse de la tabla.
export type DB_NewMemberRestriction = typeof newMemberRestrictions.$inferSelect;
