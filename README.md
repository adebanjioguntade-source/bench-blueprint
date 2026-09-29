# The Bench Blueprint

A guided, resumable web app for Lami Oguntade’s career-reinvention workbook. Visitors take a public 5-minute diagnostic, then continue through the Minimum Viable Path (sections 00, 01, 02, 03, 05, 10, 15). Earlier answers carry forward into later sections. Accounts, autosave, a generated report, and an optional AI positioning helper live behind sign-in.

This is a **Next.js 16 App Router** app that needs a **Node.js server**. It is not a static site.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Supabase (Auth + Postgres + Row Level Security)
- Anthropic API (Section 05 assist, server-side only)
- Resend (optional diagnostic-result email)
- PostHog (optional funnel events — no field content, no session replay)

## Local setup (Windows PowerShell)

```powershell
cd "C:\Users\muyiw\Downloads\AI-MVPs\The Bench Blueprint"
npm install
copy .env.example .env.local
```

Edit `.env.local` with real values (see below). Then:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing page should send you to `/diagnostic`.

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env` or `.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only. Leads, account delete, AI rate-limit logs |
| `ANTHROPIC_API_KEY` | Yes in production | Section 05 assist. Production returns 503 if missing; development may mock |
| `RESEND_API_KEY` | No | Diagnostic result email. Logged and skipped if unset |
| `RESEND_FROM_EMAIL` | No | From-address for Resend |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical origin for email links |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Funnel analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Defaults to `https://us.i.posthog.com` |

Placeholder strings in these values are rejected. The app will not talk to a fake Supabase project.

## Database

In the Supabase SQL editor (or CLI), apply migrations in order:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_lock_handle_new_user.sql`

If `001` was already applied, still run `002` on that database. It recreates `handle_new_user` with a locked `search_path`.

## Supabase Auth URLs

Authentication → URL configuration:

- **Site URL:** `http://localhost:3000` locally, `https://YOUR-DOMAIN` in production
- **Redirect URLs:** `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`

Enable email (password and magic link / OTP) to match the login page.

## Deploy on Vercel (recommended)

Do not FTP files or upload `node_modules` / `.next` to PHP shared hosting.

1. Push this git repo to GitHub (this project already has `origin` if you cloned it).
2. On [vercel.com](https://vercel.com), import the repository. Framework: Next.js. Root: repository root. Leave the default Node output (do **not** set static export).
3. Paste the required env vars into the Vercel project settings.
4. Deploy. Add a custom domain; Vercel issues TLS.
5. Put the production origin in Supabase Site URL and Redirect URLs as above.
6. Apply both SQL migrations on the **production** Supabase project if they are not already applied.

CLI alternative:

```powershell
npm i -g vercel
vercel login
vercel --prod
```

## What will not work

**Cheap shared hosting (cPanel, PHP, FTP-only) cannot run this app.** Next.js 16 uses middleware, server actions, cookie auth, and an API route. `next.config.ts` does not set `output: 'export'`. You need a Node host (Vercel, or a VPS running `npm start` behind TLS).

## Product routes

| Path | Who |
|---|---|
| `/` | Marketing landing |
| `/diagnostic` | Public diagnostic (no account) |
| `/diagnostic/result` | Score, then email gate |
| `/login` `/signup` `/auth/callback` | Auth |
| `/dashboard` `/workbook/[sectionId]` `/report` `/account` | Signed-in |

## License / copyright

The Bench Blueprint™ · © 2026 Lami Oguntade. Workbook prompt copy is trademarked material. The information in this workbook is for educational purposes only and should not be construed as legal, financial, tax, or career advice.
