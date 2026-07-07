/**
 * Server-only access to Cloudflare Worker bindings.
 *
 * With @cloudflare/vite-plugin the canonical way to read bindings from anywhere
 * on the server (including module scope) is the `cloudflare:workers` virtual
 * module. This file must only ever be imported from server code (server
 * functions, server route handlers) — never from the browser bundle.
 */
import { env } from "cloudflare:workers";

/** Cloudflare Hyperdrive binding shape (only the field we need). */
interface Hyperdrive {
  connectionString: string;
}

export interface WorkerEnv {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  DATABASE_URL?: string;
  HYPERDRIVE?: Hyperdrive;
}

/** The Cloudflare env for the current request/isolate. */
export function getEnv(): WorkerEnv {
  return env as unknown as WorkerEnv;
}

/**
 * The Postgres connection string for this request. Prefers the Hyperdrive
 * binding (production, and dev via `localConnectionString` in wrangler.jsonc);
 * falls back to a plain `DATABASE_URL` (Node scripts / bare dev). Throws early
 * with an actionable message if neither is configured.
 */
export function getConnectionString(): string {
  const e = getEnv();
  const cs =
    e.HYPERDRIVE?.connectionString ??
    e.DATABASE_URL ??
    process.env.DATABASE_URL;
  if (!cs) {
    throw new Error(
      'Missing Postgres connection. Add a `hyperdrive` binding named "HYPERDRIVE" ' +
        "(with a localConnectionString for dev) to wrangler.jsonc, or set DATABASE_URL."
    );
  }
  return cs;
}
