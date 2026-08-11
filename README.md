# crost.agency

The Crost Agency digital experience: marketing landing page + diagnostic
app. See [SPEC.md](./SPEC.md) for the product spec and [CHANGELOG.md](./CHANGELOG.md)
for what's shipped.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres) ·
Resend · Gemini (AI narrative, server-side only)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Resend / Gemini keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # local dev server
npm run build        # production build
npm run lint         # eslint
npm run test:engine  # calculation engine smoke tests
npm run verify       # lint + engine tests + production build
```

## Environment variables

See [`.env.example`](./.env.example) — it is the contract, and every variable
is documented there.

Every integration degrades honestly rather than pretending:

| Missing | What happens |
|---|---|
| `RESEND_API_KEY` | Emails are logged to the server console instead of sent. Everything else completes, and the results screen only promises an email when one actually went out. |
| `GEMINI_API_KEY` | The narrative falls back to a deterministic template. Never a fabricated "AI" response. Same fallback if Gemini blocks or truncates the response. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | `/api/diagnostic` and `/api/apply` return a deliberate 503 with an actionable message. Pages still render. |
| `NEXT_PUBLIC_SITE_URL` | Falls back to the Vercel deployment URL, then `http://localhost:3000`. Only needed for a custom production domain, but absolute links in emails depend on it. |

## Database

Schema lives in `supabase/migrations/`. Apply both files in order to
whichever Supabase project this app should use — see SPEC.md §5 and the
CHANGELOG's "known gaps" for the open question on which project that is.

`0002_operational_hygiene.sql` adds a `prune_rate_limit_events()` function.
Schedule it hourly (pg_cron) or the rate-limit table grows without bound:

```sql
select cron.schedule('prune-rate-limits', '0 * * * *',
                     'select public.prune_rate_limit_events()');
```

## Deploying

Standard Next.js app, deploys to Vercel with zero extra config — just set
the environment variables above in the Vercel project settings. Set
`NEXT_PUBLIC_SITE_URL` to the production origin so emails, OG tags and
`sitemap.xml` point at the real domain.
