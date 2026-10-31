import { defineConfig } from "drizzle-kit";

// Misma ruta que usa DatabaseManager en runtime, para que `db:migrate` y
// `db:studio` apunten a la base real y no a un archivo suelto en el repo.
const dataDir = process.env.DATABASE_DIR ?? "/var/lib/vscbot";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? `${dataDir}/vscbot.db`,
  },
  verbose: true,
  strict: true,
});
