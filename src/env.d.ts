/**
 * Minimal ambient types for the Cloudflare Worker runtime used by the data/auth
 * layer. These avoid pulling in the full @cloudflare/workers-types dependency;
 * the @cloudflare/vite-plugin provides the real bindings at build/runtime.
 *
 * If you later run `wrangler types`, it will emit a richer worker-configuration
 * d.ts you can use instead.
 */

/** Cloudflare Hyperdrive binding — pooled/cached Postgres connection. */
interface Hyperdrive {
  readonly connectionString: string;
  readonly database: string;
  readonly host: string;
  readonly password: string;
  readonly port: number;
  readonly user: string;
}

/**
 * The `cloudflare:workers` virtual module exposes the current isolate's env
 * (bindings) on the server. Provided by @cloudflare/vite-plugin.
 */
declare module "cloudflare:workers" {
  export const env: {
    HYPERDRIVE?: Hyperdrive;
    DATABASE_URL?: string;
    [key: string]: unknown;
  };
}
