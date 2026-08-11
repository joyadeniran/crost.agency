-- Operational follow-ups to 0001. Additive and idempotent — 0001 is unchanged
-- so an already-applied database can take this on top.

-- 1. Rate-limit rows are write-heavy and only ever read for the last 60
--    seconds, but nothing deleted them, so the table grew without bound and
--    the counting query got slower for every request forever. Anything older
--    than an hour is far outside every window we check.
create or replace function public.prune_rate_limit_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limit_events
  where created_at < now() - interval '1 hour';
$$;

comment on function public.prune_rate_limit_events() is
  'Deletes expired IP rate-limit counters. Schedule hourly (pg_cron: select cron.schedule(''prune-rate-limits'', ''0 * * * *'', ''select public.prune_rate_limit_events()'')).';

-- 2. Supporting indexes for the lookups the app actually performs.
--    Leads are looked up by email when reconciling a repeat prospect, and
--    submissions are read newest-first for a given lead.
create index if not exists idx_leads_email on public.leads (lower(email));
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_diagnostic_submissions_lead_created
  on public.diagnostic_submissions (lead_id, created_at desc);
create index if not exists idx_applications_created_at
  on public.applications (created_at desc);
create index if not exists idx_analytics_events_lead on public.analytics_events (lead_id);

-- 3. An application is always reached through its lead, and a diagnostic is
--    only ever attached to an application belonging to the same lead. The API
--    enforces this, but a constraint means a future writer cannot get it wrong:
--    a diagnostic can only be attached if it belongs to the same lead.
create or replace function public.diagnostic_belongs_to_lead(
  p_diagnostic_id uuid,
  p_lead_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_diagnostic_id is null
      or exists (
        select 1
        from public.diagnostic_submissions d
        where d.id = p_diagnostic_id
          and d.lead_id = p_lead_id
      );
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_diagnostic_matches_lead'
  ) then
    alter table public.applications
      add constraint applications_diagnostic_matches_lead
      check (public.diagnostic_belongs_to_lead(diagnostic_id, lead_id))
      not valid;
  end if;
end
$$;

-- RLS state is inherited from 0001: enabled, with no policies, on every table.
