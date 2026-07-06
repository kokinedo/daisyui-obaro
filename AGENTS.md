# daisyui-obaro — Agent Guide

A production starter: **TanStack Start + Cloudflare (Workers/Pages) + Postgres via
Hyperdrive (Drizzle) + Better Auth + Tailwind v4 + daisyUI v5 + ApexCharts**. Build the
app **on this starter**. Do NOT introduce a second styling system, do NOT swap the
router/build, do NOT downgrade any dependency.

**This is a product, not a marketing site.** Login is the front door (`/login`); the app
itself is the product (`/dashboard` and beyond). `/` redirects into the app. Do NOT build
landing/pricing/FAQ pages unless explicitly asked.

## UI system: daisyUI + the daisyUI Dashboard Skill
This starter uses **daisyUI v5** (semantic component classes on Tailwind v4) — NOT a React
component library. There are no `Button`/`Card` components to import; you compose UI from
daisyUI classes directly.

**USE THE SKILLS.** The daisyUI skills are installed in `.claude/skills/`:
- `daisyui/` — the component/color/theme reference. Consult it for correct component markup.
- `daisyui-dashboard-skill/` — the Master UI/UX protocol (foundations, page-types,
  block-patterns, content-strategy, audit). **Follow it for every screen.** Trigger it for
  any dashboard/admin/CRUD/settings/data view.

daisyUI essentials:
- Components are classes: `btn btn-primary`, `card` + `card-body`, `badge badge-soft
  badge-success`, `table`, `menu`, `drawer`, `tabs`, `stat`, `alert alert-soft`,
  `input input-bordered`, `toggle`, `modal`, `dropdown`. Prefer **soft variants**
  (`btn-soft`, `badge-soft`, `alert-soft`) — reserve solid `primary` for the main CTA.
- Color via semantic tokens ONLY: `bg-base-100/200/300`, `text-base-content` (min opacity
  `/60`), `text-primary`/`bg-primary`, `success|warning|error|info`. NEVER hardcode `#hex`
  or `bg-blue-500`. Large areas use `bg-base-200/10`.
- **Icons = iconify** (`@iconify/tailwind4`): `<span class="icon-[lucide--name] size-4"></span>`.
  NO raw `<svg>`, no `w-4 h-4` splits. The class must be a **literal string** in source
  (never build `icon-[${x}]` dynamically — the scanner won't detect it).
- **Font = DM Sans** (already wired). `font-bold` is FORBIDDEN; use `font-semibold` sparingly.
- No arbitrary values (`p-[15px]`), no `mb-*`/`me-*` — use `gap` and the 2/4/6/8 scale.
  Borders `border-base-300`; never border + shadow on the same element.

## App shell, theme, charts, avatars
- **Shell:** wrap authed pages in `AppLayout` (`#/components/app-layout`) — a daisyUI
  `drawer` sidebar that is pinned on `lg` and **slides smoothly** on mobile (native drawer
  animation; do not hand-roll). Add nav items in its `NAV` array.
- **Theme (committed — NEVER system):** themes are set via `data-theme` on `<html>`. The
  `ThemeChanger` (`#/components/theme-changer`) offers pinned daisyUI themes with a fixed
  default — **there is deliberately no "system" option and nothing reads
  `prefers-color-scheme`.** To change/add themes, edit the `@plugin "daisyui"` themes list in
  `src/styles.css`; NEVER add `--prefersdark` or a system/auto mode. Pick the default that
  matches the brand.
- **Charts = `Chart`** (`#/components/chart`, ApexCharts): `<Chart type="area" series={…} />`.
  Colors are resolved from daisyUI theme variables and re-sync on theme change — NEVER
  hardcode chart colors.
- **Avatars:** daisyUI `avatar` with initials or an icon (`avatar-placeholder`). Do not add
  an avatar image library.
- Every list/data view needs loading (`skeleton`), empty, and error states.

## Data + auth
- **Auth = Better Auth** (`src/lib/auth.ts` server, `src/lib/auth-client.ts` browser).
  Email + password, no external provider keys — it boots in demo mode. Login flow:
  `signIn.email({email,password})` then navigate.
- **DB = Postgres + Drizzle (via Hyperdrive).** Schema in `src/db/schema.ts`
  (`drizzle-orm/pg-core`); build the client with `makeDb(getConnectionString())`
  (`src/db/index.ts` + `src/lib/server-env.ts`) — NEVER query from the client. The
  connection resolves automatically: the Cloudflare **Hyperdrive** binding in prod, and a
  **local Postgres** in dev/preview. Add tables and run `npm run db:push`.
- **Demo data must be DETERMINISTIC** with STABLE ids (`src/db/seed.ts`). Demo login:
  `demo@obaro.dev` / `demo1234` (seeded on first dashboard load).
- **Third parties (Stripe/OAuth/email) honor emulator env in the demo.** If
  `STRIPE_API_BASE`/`OPENAI_BASE_URL`/`GOOGLE_OAUTH_BASE`/`GITHUB_API_BASE` are set, point
  each SDK's base URL at them; `EMAIL_TRANSPORT=console` prints emails — so checkout/login/
  email work in preview with ZERO real keys and swap to real keys unchanged on go-live.

## Deploy
`npm run deploy` builds and runs `wrangler deploy` (Cloudflare Workers). Bindings live in
`wrangler.jsonc`. The demo must boot with zero real API keys.

## Going live (handled by the factory, not you)
On owner-approved go-live the factory provisions real resources (Neon Postgres, a Cloudflare
Hyperdrive config, a domain, Email, Stripe keys). Because all DB access is centralized behind
`getConnectionString()`, none of your routes/UI change between preview and the live deploy.

## Where things live
- `src/routes/*` — routes (TanStack Start, file-based). `src/routes/api/auth/$.ts` — Better Auth mount.
- `src/components/app-layout.tsx` — authed shell (drawer). `src/components/theme-changer.tsx` —
  committed theme changer. `src/components/chart.tsx` — ApexCharts wrapper.
- `src/styles.css` — Tailwind v4 + daisyUI plugin + theme config + iconify + DM Sans.
- `src/db/*` — Drizzle schema/client/seed. `src/lib/auth*.ts` — Better Auth. `src/lib/cn.ts` —
  className joiner. `wrangler.jsonc` — bindings.
- `.claude/skills/*` — the daisyUI + dashboard skills. READ THEM.
