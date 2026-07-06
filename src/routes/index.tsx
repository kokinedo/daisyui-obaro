import { createFileRoute, redirect } from "@tanstack/react-router";

// Product-first: the root is the app, not a marketing page. Send visitors to the
// dashboard, which itself redirects to /login when there's no session.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
