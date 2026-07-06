import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config targeting Postgres.
 *
 * The factory prefers `db:push` (create tables straight from the schema — no
 * migration files to manage) against the local Postgres in dev and the Neon
 * database on go-live. `DATABASE_URL` must point at the target Postgres.
 *   npm run db:push      # sync schema → DB
 *   npm run db:generate  # (optional) emit SQL migrations into ./drizzle
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/daisyui_obaro",
  },
});
