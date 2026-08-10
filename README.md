# crost.agency

The Crost Agency digital experience: marketing landing page + diagnostic
app. See [SPEC.md](./SPEC.md) for the product spec and [CHANGELOG.md](./CHANGELOG.md)
for what's shipped.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres) ·
Resend · Claude (AI narrative, server-side only)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Resend / Anthropic keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # local dev server
npm run build         # production build
npm run lint           # eslint
npm run test:engine    # calculation engine smoke tests
```

## Environment variables

See [`.env.example`](./.env.example). Without `RESEND_API_KEY` or
`ANTHROPIC_API_KEY` set, the app still runs correctly — email sends are
logged instead of delivered, and the AI narrative falls back to a
deterministic template. Without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`,
the diagnostic and application APIs will error on submit (nothing to write
to).

## Database

Schema lives in `supabase/migrations/0001_diagnostic_schema.sql`. Apply it
to whichever Supabase project this app should use — see SPEC.md §5 and the
CHANGELOG's "known gaps" for the open question on which project that is.

## Deploying

Standard Next.js app, deploys to Vercel with zero extra config — just set
the environment variables above in the Vercel project settings.
