# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [1.1.0] — 2026-08-11

A correctness and quality pass over the whole experience: fixing flows that
promised something the code didn't deliver, making the diagnostic honest when
it can't answer, and pulling every hand-written colour and CTA back into the
design system.

### Fixed

- **"Apply to Crost" was a dead end.** Four prominent CTAs (nav, hero, final
  CTA, footer) linked to `/apply`, which required a `?lead=` parameter only a
  completed diagnostic could supply. Everyone arriving from those buttons hit a
  wall telling them to go run the diagnostic. `/apply` now works standalone —
  it collects a business name and email and creates the lead itself — while
  still skipping those questions when a diagnostic is on file.
- **The diagnostic email's apply link was broken twice over.** It omitted the
  `lead` parameter the application form is keyed on, so following it landed on
  a form that could not be submitted; and it hardcoded `app.crost.agency`,
  which is not where this ships. Absolute URLs now resolve through
  `NEXT_PUBLIC_SITE_URL` (falling back to the Vercel deployment URL), and the
  link carries both ids.
- **Clock skew classified real users as bots.** The minimum-time-on-form check
  diffed a client timestamp against the server clock, so a visitor whose device
  clock ran fast produced a negative elapsed time, was silently dropped, and
  saw a generic failure. The form now reports a duration it measured itself,
  counted from page load rather than from the "Start" click.
- **Most analytics events were being thrown away.** All three endpoints shared
  one 5-request-per-minute IP limit, but a single diagnostic run legitimately
  emits eight or more events — and analytics is fire-and-forget, so the loss
  was silent. Limits are now per bucket.
- **HTML injection into the internal notification email.** The free-text
  "Anything else?" field was interpolated raw into the internal email body.
  Every interpolated value is now escaped.
- **A confident result made entirely of em dashes.** A ROAS goal with no stated
  ad spend has nothing for the multiple to act on, so every money output was
  null — yet confidence could still score HIGH. Formula bumped to `v2`:
  confidence is scored only once the model is priceable, and the results screen
  gets a dedicated branch that says what's missing instead of rendering the
  normal cards with blanks in them.
- **`.env.example` didn't exist**, despite being referenced by the README, the
  spec, and a thrown error message.
- Missing `error`, `global-error` and `not-found` boundaries — an unhandled
  error showed the framework's default page.
- Double focus rings on every input: the field wrapper and the inner input each
  drew their own.
- The landing page's worked example didn't divide — it showed $12,000 of
  acquisition spend over 90 days beside "$4,200" a month.
- A pending fade timeout in the rotating hero stat could fire after unmount;
  its cleanup was returned from inside `setInterval`, where nothing could call
  it. It also ignored `prefers-reduced-motion`.
- Per-customer money figures rounded to whole dollars, so a $28.80 gross profit
  displayed as "$29".

### Added

- **Honest "we can't price this" result** — names the exact inputs it needs and
  what each would unlock, with a button back to the step that collects them.
- **Client-side validation** on every field, with inline errors: email format,
  negative amounts, margins over 100%, implausible targets.
- **Draft persistence.** In-progress answers are kept in `sessionStorage`, and
  returning to the diagnostic offers to resume rather than discarding a form
  people had to look figures up for.
- **A live model on mobile.** The preview panel was desktop-only, so most
  visitors got no feedback at all from the one feature designed to give it.
- Diagnostic numbers are shown on the application form, so "we've already got
  your numbers" is demonstrated rather than asserted.
- Redesigned transactional emails: branded, responsive, and honest about an
  unpriceable result.
- Accessibility: skip link, focus management between wizard steps, arrow-key
  navigation for the pill radio groups, `aria-live` on the live model,
  `role="alert"` on errors, `rel="noopener noreferrer"` on external links.
- SEO and sharing: `metadataBase`, canonical URLs, OpenGraph and Twitter cards,
  a generated OG image, `sitemap.xml` and `robots.txt`.
- `0002_operational_hygiene.sql` — a pruning function for the unbounded
  `rate_limit_events` table, supporting indexes, and a check constraint
  enforcing that an application's diagnostic belongs to its lead.

### Changed

- **One CTA implementation.** The brand gradient button was hand-written as an
  arbitrary Tailwind value at five call sites, which is how its two ends
  drifted out of sync with the `--grad-brand` token. All CTAs now route through
  `Button`/`ButtonLink`.
- **Every colour traces to a token.** Roughly twenty raw hex values (borders,
  placeholders, disabled states, status chips) were inlined in components;
  they are now named tokens in `globals.css`.
- **Email is asked for once.** It was required on step 1 and again on the step-5
  "email gate", so people typed it twice.
- The AI narrative runs on `claude-opus-5`, with a system prompt separated from
  the facts payload and explicit handling for a safety refusal.
- Copy across the landing page, wizard and application: the guarantee now
  states plainly that the performance fee is *refunded*, and that media spend
  is not covered.
- API routes return structured, human-readable error messages, and a
  deliberate 503 when the database isn't configured instead of a 500.

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
