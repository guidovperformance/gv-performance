-- Vervolg op 20260625201624: expliciete GRANTs, anders krijgen zelfs
-- service_role/anon "permission denied" ondanks correcte RLS-policies.

grant select, insert, update, delete on public.testimonials to service_role;
grant select, insert, update, delete on public.case_results to service_role;
grant select on public.testimonials to anon, authenticated;
grant select on public.case_results to anon, authenticated;
