-- Additief: ondersteunt autosave tijdens training, inzien van voltooide trainingen,
-- bewerken van ingevulde waarden, en "vorige keer"-historie per oefening.
-- Geen bestaande kolommen gewijzigd/verwijderd. Bestaande rijen (4x session_logs,
-- 24x exercise_logs) zijn al afgeronde trainingen en krijgen terecht de defaults
-- status='voltooid' / completed=true.

alter table public.training_sessions add column if not exists status text not null default 'gepland'
  check (status in ('gepland','in_uitvoering','voltooid'));

alter table public.session_logs add column if not exists status text not null default 'voltooid'
  check (status in ('in_uitvoering','voltooid'));
alter table public.session_logs add column if not exists current_exercise_id uuid null
  references public.session_exercises(id) on delete set null;
alter table public.session_logs add constraint session_logs_session_id_unique unique (session_id);

alter table public.exercise_logs add column if not exists completed boolean not null default true;
alter table public.exercise_logs add constraint exercise_logs_log_exercise_set_unique
  unique (session_log_id, session_exercise_id, set_number);
