# Handoff — Dashboard analytics (redesign-plan.md §8.2)

## Context
Bouwen van 3 dashboard-features, één voor één, per stuk bevestigen vóór bouwen:
1. **Voortgangsgrafieken** (1RM, VO2max, HRV-trend) — **in opbouw, bijna klaar**
2. **HRV-readiness flow** (groen ≥95% baseline / geel 85-95% -20% volume / rood <85% mobiliteit/LSD + dag-advies) — **nog niet gestart**
3. **Test/nulmeting-module met GBRS-normen** — **nog niet gestart**

Regels (blijven gelden voor alle stukken):
- Next.js App Router, **geen TypeScript**.
- Bestaande tabellen (`test_results`, `session_exercises`) respecteren; migraties **alleen additief**, niets destructiefs.
- Plan + schema-impact tonen vóór elke wijziging, pas bouwen na bevestiging.
- Build moet slagen (`RESEND_API_KEY=re_dummy_for_build_check npm run build`).
- Per module los opleveren en testen, geen regressie op bestaande dashboard-flows.
- Pas committen/pushen na expliciete bevestiging van de gebruiker.

## Stuk 1 — Voortgangsgrafieken: status

**Goedgekeurd plan (gebruiker zei "ja is goed"):**
- Geen migratie nodig — kolommen bestaan al: `test_results.deadlift_1rm`, `bench_1rm`, `squat_1rm`, `vo2max` (bestond al, maar werd nooit gevuld).
- HRV-trend chart bewust **uitgesloten** van Stuk 1 (geen databron, hoort bij Stuk 2).
- Nieuwe tab "🏋️ Kracht & conditie" toegevoegd aan **bestaande** pagina `/dashboard/client/history` (al bereikbaar via BottomNav "Voortgang") — geen nieuwe route/nav-item.
- Nieuwe dependency: `recharts` (toegevoegd, akkoord).
- Bonusfix: `vo2max` (Cooper-formule, al lokaal berekend als `cooper_vo2max`) wordt nu ook **opgeslagen** bij testaanmaak — fixt een sluimerende bug waarbij coach-dashboard `testResults[0].vo2max` toonde maar dit veld altijd leeg was.

**Wat al gedaan is:**
- `app/dashboard/coach/clients/[id]/test/new/page.js`: save-payload uitgebreid met `vo2max: cooper_vo2max ? parseFloat(cooper_vo2max) : null,` (geen losse edit-pagina gevonden die dit dupliceert).
- `app/dashboard/client/history/page.js`: volledig herschreven met:
  - `recharts` import (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer)
  - `testResults` state + fetch uit `test_results` (gefilterd op `client_id`, gesorteerd op `test_date`)
  - `strengthData` (Deadlift/Bench/Squat) en `vo2Data` afgeleide arrays
  - Derde tab `['tests','🏋️ Kracht & conditie']` toegevoegd aan tab-switcher
  - Volledige render-branch voor `tab === 'tests'`: 1RM-progressie LineChart, VO2max-trend LineChart, en empty states (geen testresultaten / geen 1RM- of VO2max-data)
  - Bestaande "Stats"-branch ongewijzigd gebleven, alleen de ternary is van 2-weg naar 3-weg gemaakt.

**Belangrijke bevinding tijdens RLS-check:**
- Anon/client-side Supabase key krijgt `permission denied for table test_results` bij `select('*')`. Dit moet eerst opgelost worden — anders blijft de nieuwe "Kracht & conditie"-tab altijd leeg voor de klant, ook als er data is. **Er is nog geen RLS policy die de klant zijn eigen test_results laat lezen.** Dit is de eerstvolgende blocker.

## Volgende stappen (in deze volgorde)
1. **RLS fixen**: SELECT-policy toevoegen op `test_results` zodat een ingelogde klant zijn eigen rijen mag lezen (vergelijkbaar met hoe `daily_checkins` en `client_profiles` waarschijnlijk al een policy hebben — die ter referentie bekijken). Dit is additief (alleen een policy toevoegen, geen schema-wijziging) maar **toch eerst tonen aan gebruiker en bevestigen**, want het raakt security/RLS.
2. `npm run build` draaien ter verificatie (`RESEND_API_KEY=re_dummy_for_build_check npm run build`).
3. Visueel testen (Playwright, desktop + mobiel) — check of charts renderen, empty states correct zijn, geen regressie op Check-ins/Stats tabs.
4. Bevestiging vragen aan gebruiker → dan committen/pushen.
5. Daarna pas: plan voor **Stuk 2 (HRV-readiness)** voorleggen en bevestigen vóór bouwen.
6. Daarna: plan voor **Stuk 3 (Test/nulmeting-module GBRS-normen)** voorleggen en bevestigen vóór bouwen.

## Relevante bestanden
- `app/dashboard/client/history/page.js` — nieuwe Kracht & conditie tab (klaar, behalve RLS-afhankelijkheid)
- `app/dashboard/coach/clients/[id]/test/new/page.js` — vo2max-save fix (klaar)
- `app/api/dashboard/save-test/route.js` — generieke insert-route, ongewijzigd
- `app/dashboard/client/components.js` — BottomNav, ongewijzigd
- `app/dashboard/coach/eigen-training/page.js` — bron van de groen/geel/rood `calcStatus()` banding-logica, te hergebruiken in Stuk 2
