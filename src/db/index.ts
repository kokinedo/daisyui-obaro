import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "#/db/schema";

/**
 * Build a Drizzle ORM instance over Postgres.
 *
 * The connection string comes from the Cloudflare **Hyperdrive** binding in
 * production (`env.HYPERDRIVE.connectionString`) and from a **local Postgres**
 * in dev/preview (Hyperdrive's `localConnectionString` in wrangler.jsonc, or a
 * plain `DATABASE_URL` in a Node script). Call this inside a server function /
 * server route (or a seed/migrate script) with the resolved connection string —
 * see `getConnectionString()` in `#/lib/server-env`.
 *
 * `fetch_types:false` + a small pool are the recommended settings for postgres.js
 * over Cloudflare Workers + Hyperdrive.
 */
export function makeDb(connectionString: string) {
  const client = postgres(connectionString, { max: 5, fetch_types: false });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof makeDb>;
