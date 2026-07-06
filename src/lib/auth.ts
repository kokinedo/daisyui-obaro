import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { makeDb } from "#/db/index";
import { schema } from "#/db/schema";
import { getConnectionString, getEnv } from "#/lib/server-env";

/**
 * Better Auth server instance factory (server-only).
 *
 * - Runs on **Postgres** via the Drizzle adapter (the same `#/db` client used by
 *   the app), so auth + domain data share one database — local Postgres in
 *   dev/preview, Neon via Cloudflare Hyperdrive in production.
 * - Email + password only, so it runs with ZERO real external API keys.
 * - The signing secret comes from env with a safe dev fallback so the starter
 *   boots keyless. Set BETTER_AUTH_SECRET in production.
 *
 * A fresh instance is built per request because the connection lives on the
 * per-request Cloudflare env.
 */
export function createAuth() {
  const env = getEnv();
  const db = makeDb(getConnectionString());
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    secret:
      env.BETTER_AUTH_SECRET ??
      "dev-insecure-cf-obaro-secret-change-me-in-production",
    baseURL: env.BETTER_AUTH_URL ?? undefined,
    emailAndPassword: {
      enabled: true,
      // Keyless demo: no email verification flow required to sign in.
      requireEmailVerification: false,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
