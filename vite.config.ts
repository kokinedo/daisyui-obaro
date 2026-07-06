import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // The free preview tier serves this dev server through an ad-hoc Cloudflare
  // `trycloudflare` tunnel (a fresh random *.trycloudflare.com host each build).
  // Vite's dev server blocks unknown Host headers by default and would answer 403
  // to the tunnel — so the owner's preview never renders. Allow any host: this is
  // an ephemeral, local, owner-only preview server, so the host check adds nothing.
  server: { allowedHosts: true },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
