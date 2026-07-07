import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// IMPORTANT: do NOT add the @tanstack/devtools-vite `devtools()` plugin (or the
// <TanStackDevtools> component). Its `__tsd/console-pipe` SSE channel constantly
// reconnects, and through the ephemeral trycloudflare preview tunnel that
// connection thrashes (500/502/520/524) — which destabilizes HMR, makes the
// client hydration entry fail to load, and leaves the app half-hydrated so real
// clicks never reach React's handlers (dead buttons in the preview). Keep
// devtools out so the owner's preview stays interactive.
const config = defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
  // The free preview tier serves this dev server through an ad-hoc Cloudflare
  // `trycloudflare` tunnel (a fresh random *.trycloudflare.com host each build).
  // Vite's dev server blocks unknown Host headers by default and would answer 403
  // to the tunnel — so the owner's preview never renders. Allow any host: this is
  // an ephemeral, local, owner-only preview server, so the host check adds nothing.
  server: { allowedHosts: true },
});

export default config;
