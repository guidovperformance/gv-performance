-- Additieve SELECT-policy zodat een ingelogde klant zijn eigen test_results mag lezen.
-- Volgt hetzelfde patroon als de bestaande policy op daily_checkins/client_profiles:
-- client_profiles.user_id = auth.uid(), client_profiles.id = test_results.client_id.

grant select on public.test_results to authenticated;

create policy "Clients can read their own test results"
  on public.test_results
  for select
  to authenticated
  using (
    client_id in (
      select id from public.client_profiles where user_id = auth.uid()
    )
  );
