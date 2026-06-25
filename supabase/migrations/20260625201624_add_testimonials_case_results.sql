-- Testimonials (homepage "Bewijs"-sectie + /testimonials) en case_results
-- (/resultaten) als data-gedreven content i.p.v. hardcoded placeholders.
-- Beide tabellen zijn publiek leesbaar via RLS, alleen voor published=true
-- rijen. Invoer gebeurt handmatig via de Supabase dashboard (geen publieke
-- insert-policy nodig).

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  segment text check (segment in ('tactical', 'topsport', 'amateur')),
  quote text not null,
  result_metric text,
  avatar_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.case_results (
  id uuid primary key default gen_random_uuid(),
  client_label text not null,
  segment text check (segment in ('tactical', 'topsport', 'amateur')),
  goal text,
  baseline text,
  result text,
  duration_weeks integer,
  metric_json jsonb,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
alter table public.case_results enable row level security;

create policy "Publiek leesbaar — published testimonials"
  on public.testimonials for select
  using (published = true);

create policy "Publiek leesbaar — published case_results"
  on public.case_results for select
  using (published = true);
