-- Crost Diagnostic — core schema (brief section 33, plus rate limiting and
-- analytics which the brief calls for functionally but doesn't table out).
--
-- Design rules this schema enforces:
--   * diagnostic_submissions rows are never updated or overwritten — each
--     calculation is a new row, tagged with formula_version, so a past
--     result can always be reproduced against the rules that produced it.
--   * RLS is enabled with NO policies on every table: the anon/authenticated
--     roles get zero access. All reads/writes happen server-side through
--     the service role key in Next.js API routes, which apply their own
--     validation and rate limiting first.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  email text not null,
  industry text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnostic_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  inputs jsonb not null,
  derived_metrics jsonb not null,
  outputs jsonb not null,
  confidence text not null check (confidence in ('HIGH', 'MEDIUM', 'NEEDS_MORE_DATA')),
  formula_version text not null,
  ai_narrative text,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  diagnostic_id uuid references public.diagnostic_submissions(id) on delete set null,
  company_stage text,
  current_agency text,
  decision_timeline text,
  heard_about text,
  notes text,
  created_at timestamptz not null default now()
);

-- IP-bucketed counters for the honeypot+timing+rate-limit trio guarding the
-- public /api/diagnostic and /api/apply routes.
create table if not exists public.rate_limit_events (
  id bigserial primary key,
  bucket text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigserial primary key,
  event_name text not null,
  lead_id uuid references public.leads(id) on delete set null,
  properties jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_diagnostic_submissions_lead_id on public.diagnostic_submissions(lead_id);
create index if not exists idx_applications_lead_id on public.applications(lead_id);
create index if not exists idx_applications_diagnostic_id on public.applications(diagnostic_id);
create index if not exists idx_rate_limit_bucket_identifier_created on public.rate_limit_events(bucket, identifier, created_at);
create index if not exists idx_analytics_events_name_created on public.analytics_events(event_name, created_at);

alter table public.leads enable row level security;
alter table public.diagnostic_submissions enable row level security;
alter table public.applications enable row level security;
alter table public.rate_limit_events enable row level security;
alter table public.analytics_events enable row level security;
