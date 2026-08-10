# Crost Digital Experience — Spec

**v1.0 · 2026**

This is the product spec for the Crost Agency website and diagnostic app, as
built. It documents what the system does and why, so a calculation made
today stays explainable a year from now.

## 1. Product context

Crost Agency is a Lagos-based performance marketing agency built around
measurable outcomes. The proposition: **agree on the number, put our fee at
risk against it.**

The digital experience has two surfaces:

- **The landing page** (`/`) sells the belief — bold, editorial, dramatic.
- **The diagnostic app** (`/diagnostic`, `/apply`) proves the method — calm,
  precise, fast.

Both share the same design tokens (color, type, spacing, motion) from the
Crost Brand System v2.0. Nothing in either surface introduces a color,
radius, shadow, or typeface outside that system.

**Currency: USD only.** No NGN, no currency toggle, no user-facing
conversion. This is a deliberate v1 decision — see CHANGELOG.

## 2. The core idea

**What's the number?** Crost reframes every prospect conversation around a
measurable outcome — new customers, revenue, ROAS, CAC — instead of
activity (posts, impressions, meetings, reports).

## 3. The diagnostic — how it thinks

The diagnostic is a **performance diagnostic and qualification engine**, not
a client dashboard, not campaign management software, and explicitly not an
"AI growth strategist." It:

1. Understands the business (name, email, industry).
2. Models the economics (ad spend, CAC, AOV/LTV, gross margin, and
   optionally funnel behavior — visitors, conversion rate).
3. Produces an indicative target, transparently, from a versioned formula.
4. Qualifies the prospect into an application.

### 3.1 CAC resolution

CAC is either:

- **provided** directly, or
- **derived**, from `monthly ad spend ÷ monthly customers acquired` when
  both are given and CAC is not, or
- **unavailable** — and the engine does **not** manufacture a number. It
  says plainly that there isn't enough acquisition data yet.

Monthly visitors and conversion rate are captured for human review only —
they do not feed the acquisition-cost formula. (Knowing a funnel converts at
3% doesn't tell you what the traffic cost to acquire.)

### 3.2 Formula

Given a resolved CAC, a goal (`customers` | `revenue` | `roas`), a target
value, and a timeframe in days:

```
months = timeframeDays / 30

# resolve target customers / revenue depending on goal type
customers goal:  targetCustomers = target;            revenueTarget = targetCustomers × AOV
revenue goal:    revenueTarget = target;               targetCustomers = revenueTarget ÷ AOV
roas goal:       revenueTarget = monthlyAdSpend × target(ROAS) × months
                 targetCustomers = revenueTarget ÷ AOV

totalAcquisitionSpend        = targetCustomers × resolvedCAC
estimatedMonthlyMediaRequired = totalAcquisitionSpend ÷ months
grossProfitPerCustomer        = AOV × grossMargin%
grossProfitTotal              = revenueTarget × grossMargin%
ltvToCac                      = AOV ÷ resolvedCAC
expectedCustomersFromCurrentSpend = monthlyAdSpend ÷ resolvedCAC   # live-preview only
```

Implementation: `src/lib/calc/engine.ts`. Pure function, no I/O, unit-tested
against the worked examples in `engine.smoke.ts` (`npm run test:engine`).

### 3.3 Confidence

- **HIGH** — CAC provided directly, and AOV/LTV and gross margin both known.
- **MEDIUM** — CAC resolved (provided or derived) and AOV/LTV known, but
  something else is missing (e.g. margin).
- **NEEDS_MORE_DATA** — CAC could not be resolved at all. No media figure is
  shown; the diagnostic says so honestly instead of guessing.

### 3.4 AI narrative — strictly downstream

The AI (Claude, server-side only) receives **only the already-computed
outputs** — never raw form inputs, never the ability to alter a number. See
`src/lib/ai/narrative.ts`: the input type is a deliberately narrow
`NarrativeFacts` shape. If that type ever grows to include raw inputs, the
isolation this spec requires has been broken.

Without an `ANTHROPIC_API_KEY`, a deterministic templated summary is used
instead — never a fabricated "AI" response.

## 4. The guarantee

Landing-page copy states the commercial model as: **agree a measurable
outcome, put the performance fee at risk against it — if the campaign
misses the agreed target under the agreed conditions, the performance fee is
refunded.** The site deliberately does **not** claim "we pay your media" —
that's a different (much larger) risk commitment that hasn't been legally or
operationally defined yet.

## 5. Data model

Four tables, Postgres/Supabase (`supabase/migrations/0001_diagnostic_schema.sql`):

| Table | Purpose |
|---|---|
| `leads` | One row per prospect (business name, email, industry, website). |
| `diagnostic_submissions` | One row per diagnostic run: `inputs`, `derived_metrics`, `outputs` (all jsonb), `confidence`, `formula_version`, `ai_narrative`. **Never updated or overwritten** — a new calculation is always a new row, so a past result can be reproduced against the rules that produced it. |
| `applications` | One row per application, linked to `lead_id` and optionally `diagnostic_id`. |
| `rate_limit_events` / `analytics_events` | Infrastructure tables — not in the original brief's data model, but required to actually implement the rate-limiting and analytics-tracking requirements. |

RLS is **enabled with no policies** on every table. Nothing is reachable via
anon/authenticated roles. All reads and writes happen server-side, through
the app's own API routes, using the Supabase service role key.

## 6. Routes

| Route | What it is |
|---|---|
| `/` | Marketing landing page |
| `/diagnostic` | 5-step diagnostic wizard → results reveal |
| `/apply?lead=…&diagnostic=…` | Short application, pre-filled from a diagnostic |
| `/api/diagnostic` | Validates, computes (server-side, authoritative), stores, emails, returns result |
| `/api/apply` | Validates, stores, emails |
| `/api/analytics` | Lightweight first-party event log |

v1 ships all of this from a single Next.js app rather than splitting
`crost.agency` / `app.crost.agency` into separate codebases — see
CHANGELOG for the reasoning. The split can happen later via routing/DNS
without a rewrite.

## 7. What v1 deliberately does not build

Per brief: no client dashboard, no campaign management, no ad account
management, no reporting platform, no "AI growth strategist," no automated
guarantee underwriting, no payments, no scheduling, no CRM. The product is
narrow on purpose.

## 8. Integrations and what's needed to go live

All three are wired correctly and degrade honestly when unconfigured (log
instead of silently failing, template instead of fabricating) — see
`.env.example`:

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — required for any of this to
  persist data.
- `RESEND_API_KEY` — required for actual email delivery.
- `ANTHROPIC_API_KEY` — required for the AI narrative; falls back to a
  templated summary without it.

Bot protection is a honeypot field plus a minimum-time-on-form check plus
Supabase-backed IP rate limiting (`src/lib/security/`) — no third-party
CAPTCHA service is connected.
