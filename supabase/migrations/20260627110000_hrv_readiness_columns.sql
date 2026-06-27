-- Additieve kolommen voor HRV-readiness flow (redesign-plan.md §8.2).
-- Geen bestaande kolommen/rijen aangeraakt.

alter table public.daily_checkins add column if not exists hrv numeric null;
alter table public.client_profiles add column if not exists hrv_baseline numeric null;
