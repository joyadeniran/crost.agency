# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-08-10

Initial build of the Crost digital experience: marketing landing page,
diagnostic app, and application flow, per the master brief.

### Added

- **Landing page** (`/`) — hero, "we don't sell activity," the Crost
  difference, the bet, the process, diagnostic CTA, diagnostic preview, AI
  trust section, who it's for / not for, final CTA, footer.
- **Diagnostic** (`/diagnostic`) — 5-step mobile-first wizard (business,
  economics, funnel behavior, target, email gate) with a live-updating
  desktop preview panel, followed by an editorial results reveal ("here's
  what the math says") with an AI narrative.
- **Application** (`/apply`) — short form pre-filled from a completed
  diagnostic (company stage, current agency, decision timeline, how they
  heard about Crost, free-text notes).
- **Calculation engine** (`src/lib/calc/engine.ts`) — CAC known/derived/
  unavailable branching, confidence scoring, formula-versioned outputs.
  Covered by a smoke test reproducing the brief's worked examples exactly.
- **API routes** — `/api/diagnostic`, `/api/apply`, `/api/analytics`, all
  with server-side Zod validation, honeypot + timing bot checks, and
  Supabase-backed IP rate limiting. Calculation is always authoritative
  server-side; the client's numbers are never trusted for storage.
- **Database schema** (`supabase/migrations/0001_diagnostic_schema.sql`) —
  `leads`, `diagnostic_submissions`, `applications`, plus `rate_limit_events`
  and `analytics_events`. RLS enabled with no anon/authenticated policies —
  everything goes through the service role in API routes.
- **Email** — Resend integration for prospect + internal notification
  emails on both diagnostic completion and application submission.
- **AI narrative** — Claude, server-side only, scoped to a narrow
  already-computed-outputs type so it can explain the math but never
  invent or alter it. Falls back to a deterministic template without an
  API key.
- **Brand system compliance** — every color, radius, spacing value, and
  type size traces back to the Crost Brand System v2.0 tokens
  (`src/app/globals.css`), reused from the previously-implemented brand
  guide rather than redefined.

### Decisions

- **USD only, no NGN.** An earlier draft of the brief mixed currencies;
  this was confirmed explicitly and the interface never displays NGN.
- **Single Next.js app for both `crost.agency` and `app.crost.agency`.**
  V1 ships marketing and diagnostic routes from one codebase rather than
  two, to avoid duplicating the design system and API layer before there's
  a reason to split them. The domain split can happen later via routing/
  DNS.
- **Guarantee copy: fee-at-risk, not "we pay your media."** The landing
  page states Crost puts its performance fee at risk against the agreed
  target; it does not make the much larger (and financially different)
  claim of covering the client's media spend. That's an intentional
  scoping decision, not an oversight.

### Fixed

- CSS cascade bug: an unlayered global `a { color: pink }` rule was
  overriding `text-white` utility classes on link-styled buttons —
  most visibly, the "Apply with these numbers →" CTA rendered pink text on
  a pink/violet gradient background. Fixed by moving base element styles
  into Tailwind's `@layer base`, restoring the normal utility-wins-over-base
  cascade everywhere, not just on that one button.
- Typography legibility: Fredoka's "V" sits close enough to a flanking "I"
  that "ACTIVITY" at the brand's usual tight display tracking optically
  read as "ACTMTY." Scoped a wider tracking to just that word rather than
  loosening the whole headline.
- Replaced the default Next.js favicon and every plain-text "CROST"
  instance (nav, footer, diagnostic top bar) with the real logo: a
  `Wordmark` component using the actual mark SVG in the brand guide's
  documented horizontal-lockup treatment, and a proper `icon.svg` built
  from the same mark per the brand guide's app-icon spec (mark on a solid
  container, never the bare lockup).

### Known gaps (tracked, not silent)

- Live Supabase project not yet decided: the existing "Crost" Supabase
  project turned out to be the live Company-OS production database, not
  spare infrastructure — needs an explicit call on a new project vs. a
  separate schema before migrations are applied for real.
- Unrelated to this work, but surfaced during that check: 4 tables in that
  same production project have RLS disabled and are fully exposed via the
  anon key. Not touched here; flagged for the owning team.
- No live `RESEND_API_KEY` or `ANTHROPIC_API_KEY` in this build
  environment — both integrations are wired correctly and degrade
  honestly, but won't send/generate for real until keys are added.
- No CAPTCHA service connected; bot protection is honeypot + timing +
  rate-limit only.
