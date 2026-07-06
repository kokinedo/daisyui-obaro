import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "#/lib/auth";

/**
 * Catch-all server route that mounts Better Auth's request handler at
 * /api/auth/*. The browser auth client (src/lib/auth-client.ts) talks to these
 * endpoints. The Better Auth instance is built per request so it picks up the
 * per-request Postgres connection (Hyperdrive in prod, local pg in dev).
 */
const handler = ({ request }: { request: Request }) =>
  createAuth().handler(request);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
