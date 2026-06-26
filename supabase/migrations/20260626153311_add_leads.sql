-- Leads voor de gratis-krachttest lead magnet. Geen publieke insert/select-
-- policy: het formulier post naar /api/leads, dat met de service-role-key
-- schrijft. De cron-route (/api/cron/nurture) leest/schrijft ook met de
-- service-role-key. Vanaf de browser is deze tabel dus niet bereikbaar.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  source text,
  invite_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists leads_email_key on public.leads (email);

alter table public.leads enable row level security;

grant select, insert, update, delete on public.leads to service_role;
