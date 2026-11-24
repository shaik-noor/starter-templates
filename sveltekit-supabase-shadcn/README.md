# SvelteKit + Supabase + shadcn-svelte starter

A production-ready, self-contained starter template using **SvelteKit (Svelte 5 runes)**, **TypeScript**, **Tailwind CSS v4**, **shadcn-svelte** and **Supabase** (Auth + PostgreSQL + RLS).

No ORM and no third-party auth library — authentication and database access go straight through `@supabase/ssr` and `@supabase/supabase-js`.

## Stack

- **SvelteKit** (Svelte 5 runes: `$state`, `$derived`, `$props`, `$effect`)
- **Tailwind CSS v4** + **shadcn-svelte** (Button, Card, Input, Label, DropdownMenu, Avatar, Sonner)
- **Supabase** — cookie-based SSR auth (`@supabase/ssr`) and Postgres with Row Level Security
- **zod** for server-side validation
- **mode-watcher** for dark/light mode, **@lucide/svelte** for icons

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Leave the Supabase values empty to run with the local SQLite fallback,
# or fill them in to use a real Supabase project.

# 3. Apply the database schema (Supabase only)
#    Paste supabase/schema.sql into the Supabase SQL Editor and run it.

# 4. Start the dev server
npm run dev
```

## Local fallback (no Supabase required)

Auth goes through a small backend interface ([`src/lib/types/app.ts`](src/lib/types/app.ts)) with two
implementations. It picks Supabase whenever `PUBLIC_SUPABASE_URL` and
`PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set, and otherwise falls back to a local SQLite database —
so you can clone the repo and use the full app immediately, with no cloud account or Docker.

- Storage: `.local/dev.db`, using Node's built-in `node:sqlite` (no native dependency).
- Passwords are hashed with `scrypt`; sessions are opaque tokens in an `httpOnly` cookie.
- A demo account is created on first run:

  | Email | Password |
  | --- | --- |
  | `demo@example.com` | `password123` |

- Reset the database at any time with `npm run db:reset`.

The fallback is a development convenience, not a production auth server. Point the environment
variables at a Supabase project to switch over; no code changes are needed.

## Environment variables

Environment variables are declared explicitly in [`src/env.ts`](src/env.ts) using `defineEnvVars`.
Variables marked `public` are importable from `$app/env/public` in both server and client code.

| Variable | Required | Description |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | no | Your Supabase project URL. Empty ⇒ local SQLite fallback. |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | no | Publishable (anon) key, safe for the browser. Empty ⇒ local SQLite fallback. |
| `SUPABASE_PROJECT_ID` | no | Project ref, used only by `npm run gen:types`. |

To add a new variable, declare it in `src/env.ts` first, then read it from `.env`.

## Project structure

```
src/
├── app.d.ts                     # Typed App.Locals / App.PageData
├── app.html
├── env.ts                       # Environment variable declarations
├── hooks.server.ts              # sequence(backendHandle, authGuard)
├── lib/
│   ├── components/              # Navbar, Footer, ThemeToggle, UserMenu + ui/*
│   ├── server/
│   │   ├── backend.ts           # Picks Supabase or the local fallback
│   │   └── local-db.ts          # SQLite fallback (node:sqlite)
│   ├── supabase/                # Browser client + config/mapping helpers
│   └── types/
│       ├── app.ts               # AppUser / AppSession / AppBackend
│       └── database.types.ts    # Generated/placeholder Database type
└── routes/
    ├── +layout.server.ts        # Validated session + cookies
    ├── +layout.ts               # Browser/server Supabase client
    ├── +layout.svelte           # onAuthStateChange + ModeWatcher + Toaster
    ├── (marketing)/             # Public landing page
    ├── (auth)/                  # login, register, auth/callback
    └── (app)/                   # Protected dashboard (sidebar shell)
supabase/
└── schema.sql                   # profiles table, signup trigger, RLS policies
```

## How auth works

1. [`src/hooks.server.ts`](src/hooks.server.ts) builds a request-scoped backend and exposes `safeGetSession()`, which only returns a session after the credential has been validated server-side (Supabase validates the JWT with `getUser()`).
2. `authGuard` redirects unauthenticated users away from `/dashboard` and signed-in users away from `/login` and `/register`.
3. The root layout listens to `onAuthStateChange` and calls `invalidate('supabase:auth')` so `depends('supabase:auth')` re-runs and refreshes the session across the app.
4. Login, signup and sign-out are SvelteKit **form actions** with progressive enhancement (`use:enhance`) and toast feedback.

## Type generation

After changing the database schema, regenerate types:

```bash
npm run gen:types
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Build for production. |
| `npm run preview` | Preview the production build. |
| `npm run check` | Type-check the project (`svelte-check`). |
| `npm run gen:types` | Regenerate `database.types.ts` from Supabase. |
| `npm run db:reset` | Delete the local SQLite database (`.local/dev.db`). |
