# Handoff — GV Performance (bijgewerkt 2 juli 2026)

## Project
- **Pad:** `C:\Users\guido\gv-performance`
- **Stack:** Next.js App Router, **geen TypeScript**, Supabase (auth+DB), Resend (mail), Vercel (auto-deploy op push naar GitHub `main`)
- **Live:** gvperformance.nl
- **Vaste regels (blijven gelden):** geen TS, additieve migraties (nooit destructief), plan tonen vóór schema-wijzigingen en bevestiging afwachten, `npm run build` moet slagen, **niet committen/pushen zonder expliciete bevestiging van Guido**, geen nieuwe dependencies zonder te melden.
- **Belangrijk:** Guido is geen developer — leg dingen in gewone taal uit, test zelf in de browser (Playwright) vóór je iets "klaar" meldt, en ruim tijdelijke testdata in Supabase altijd weer op na gebruik.
- **Supabase-migraties:** er is géén CLI-koppeling — nieuwe SQL-migratiebestanden in `supabase/migrations/` moeten door Guido zelf in de Supabase SQL Editor geplakt en gerund worden (hij kan dat inmiddels goed zelf, gewoon vragen).

## Wat er dit gesprek is gebeurd (chronologisch)

Alles hieronder is **gecommit én gepusht** naar `main`, tenzij anders vermeld.

1. **Technische QA-audit** (`audit-bugs.md`) + fixes: exit-intent-popup blokkeerde het contactformulier, mobiele CTA niet boven de vouw, 8 pagina's deelden dezelfde SEO-metadata (nu elk eigen server-metadata via losse `*Client.js`-bestanden), kapotte OG-afbeelding blogpost, a11y-labels.
2. **Klantreis-audit** (`audit-klant.md`, persona: prijs-twijfelende koper) + top-5 quick wins gebouwd: echte dashboard-screenshots i.p.v. placeholders op de homepage, exit-popup trigger later (80% i.p.v. 60% scroll), "schema vs. coaching"-vergelijkingsblok, testimonial-fallback op `/resultaten`, uitgebreide `/expertise`.
3. **Trainingsflow-bugfix (grote klus):** drie samenhangende problemen opgelost —
   - **Autosave** tijdens een training (debounced + bij set-toggle/oefening-wissel/pagina verlaten), zodat tussentijds weg navigeren niets meer verliest.
   - **Voltooide trainingen** openen nu een read-only overzicht i.p.v. opnieuw te starten, met een "Waarden bewerken"-knop.
   - **"Vorige keer"-hint** per oefening (laatst bekende gewicht/reps uit eigen geschiedenis).
   - Schema additief uitgebreid: `training_sessions.status`, `session_logs.status`/`current_exercise_id`/unique-constraint, `exercise_logs.completed`/unique-constraint. Nieuwe/gewijzigde routes: `/api/dashboard/save-session-log` (nu upsert), nieuwe `/api/dashboard/session-progress` (GET+POST voor autosave).
   - **Tijdens het testen gevonden en gefixt:** een echte race condition in de autosave-logica (refs werden bijgewerkt binnen een React state-updater i.p.v. er synchroon buiten — nu gefixt in `session/[id]/page.js`).
4. **Hardloop/conditie-fix:** de plan-builder vulde automatisch een verborgen `distance:'400'`-default in bij nieuwe conditie-oefeningen, die als "echte" waarde werd opgeslagen zelfs als de coach het veld nooit aanraakte. Nu starten nieuwe conditie-oefeningen leeg, met een nieuw notitie/opdracht-veld ("Loop maximaal tot je boven zone 3 komt") als alternatief voor een vaste afstand/tijd — in zowel `plan/new` als `plan/[planId]` (plan wijzigen). Klant-weergave toont bij een leeg doel nu een instructieblok i.p.v. kapotte "—"-rijen.
5. **Mobiele hero-video-fix:** de mobiele hero gebruikte een portret-video (1080×1920) in een brede/korte container, waardoor er nog maar ~28% van zichtbaar bleef (en dan nog het verkeerde stuk). Nu gebruikt mobiel dezelfde vierkante video (1080×1080) als desktop, met aangepaste `object-position`. Ook een bestaande korte-viewport-mediaquery verbreed zodat de CTA ook op 360×740 boven de vouw blijft (bleek al zo vóór deze wijziging, geen regressie, wel meegefixt).
6. **Dashboard-audit** (`audit-dashboard.md`) — **read-only, NIETS geïmplementeerd, NOG NIET GECOMMIT** (staat als ongetrackt bestand in de working directory). Bevat een designer-pass + een "topsport-klant die het dagelijks gebruikt"-pass, eindigend met:
   - **Top 5 quick wins:** (1) lege oefeningnamen op de Week-pagina fixen (`ex.exercises?.name` → `ex.exercise_name || ex.exercises?.name`, kleine fix/grote impact), (2) "nog openstaande training"-banner op Home bij een `in_uitvoering`-sessie van een eerdere dag, (3) HRV zichtbaar maken (wordt nu overal gevraagd, nergens getoond — geen trendgrafiek, geen historie), (4) "vorige keer"-hints bij ochtendmetingen in de check-in, (5) grammatica "1 oefeningen" → "1 oefening".
   - **Top 3 grotere kansen:** HRV volledig integreren als zichtbare metric, consistente klik-affordance in lijstweergaven, een "wat moet ik nu doen"-logica op Home die verder kijkt dan alleen vandaag.

## Dit gesprek (2 juli): 7 dashboard-verbeteringen gebouwd — NOG NIET GECOMMIT

Guido koos 7 punten uit `audit-dashboard.md` om te bouwen (bev. 2, 3, 7, 14 en grotere kansen 2 & 3 bewust **niet** meegenomen — aparte beslissing). Alle 7 zijn geïnspecteerd, gepland, gebouwd, `npm run build` slaagt (met dummy `RESEND_API_KEY`, zie hieronder), en getest in de browser met tijdelijke Supabase-testdata (aangemaakt + na afloop volledig weer opgeruimd, geverifieerd leeg). Nog **niet gecommit/gepusht** — wacht op bevestiging.

1. **Lege oefeningnamen (bev. 8):** `ex.exercises?.name` → `ex.exercise_name || ex.exercises?.name` in `week/page.js`, `page.js` (Home) én `agenda/page.js` (bonus, zelfde bug daar ook gevonden tijdens inspectie — stond niet expliciet in de audit-tekst).
2. **"Nog openstaande training"-banner (bev. 9):** op Home, rood-accent, toont meest recente `in_uitvoering`-sessie van een eerdere dag met Hervat-link.
3. **HRV volledig zichtbaar (bev. 1+10):** HRV-trendgrafiek in Voortgang → "Kracht & conditie"-tab (naast 1RM/VO2max, data uit `daily_checkins`; leeg-state-voorwaarde van die tab verruimd zodat de grafiek ook zonder testresultaten zichtbaar is), HRV in check-in-kaarten + nieuwe "Gem. HRV"-stat-tegel, duidingstekst bij het HRV-veld in de check-in.
4. **"Vorige keer"-hints (bev. 11):** bij gewicht/polsslag/HRV in de check-in, o.b.v. de laatst ingevulde check-in.
5. **Grammatica (bev. 4):** "1 oefeningen" → "1 oefening" op Home, Week, Agenda én sessiedetail (4 plekken).
6. **Autosave-indicator (bev. 13):** "✓ Opgeslagen" nu groen/vet + korte flash-animatie (nieuwe `.autosave-flash`-keyframe in `globals.css`), autosave-logica zelf niet aangeraakt.
7. **Sets-samenvatting in voltooide sessie (bev. 5):** statische "X/Y SETS VOLTOOID"-regel in de read-only weergave, verdwijnt automatisch zodra "Waarden bewerken" actief is.

**Regressiecheck gedaan:** bewerken/annuleren-flow van een voltooide sessie getest (samenvatting verdwijnt tijdens bewerken, komt terug na annuleren) — geen breuk.

**Bekend, niet aan gerelateerd:** lokale `npm run build` faalt zonder `RESEND_API_KEY` env-var (ontbreekt in `.env.local`, bestond al vóór dit gesprek, geverifieerd op `main` zonder mijn wijzigingen). Werkt wel op Vercel (key staat daar). Voor lokale build-checks: `RESEND_API_KEY=re_dummy npm run build`.

**Nieuw:** `.claude/launch.json` aangemaakt in de home-directory (`C:\Users\guido\.claude\launch.json`) om de dev-server te kunnen starten via de preview-tool — bevat alleen een npm-run-dev commando, geen secrets.

## Openstaand / eerstvolgende stap

- Bovenstaande 7 wijzigingen **committen/pushen** — wacht op Guido's bevestiging.
- `audit-dashboard.md` is **niet gecommit/gepusht** — vraag of dat alsnog moet.
- Bev. 2, 3, 7, 14 en grotere kansen 2 & 3 uit `audit-dashboard.md` staan nog open (bewust uitgesteld, geen haast).
- Uit `audit-bugs.md` (eerdere technische audit) stonden nog een paar kleinere/lage-prioriteit punten open die niet zijn opgepakt (LinkedIn-link handmatig verifiëren, cookie-banner-overlap op mobiel, 3 ongebruikte afbeeldingen opruimen) — optioneel, geen haast.

## Relevante bestanden
- `app/dashboard/client/session/[id]/page.js` — sessie-detail (actief/hervat/voltooid/bewerken), bevat de autosave-logica
- `app/api/dashboard/session-progress/route.js` — autosave GET+POST
- `app/api/dashboard/save-session-log/route.js` — voltooien (upsert)
- `app/dashboard/client/week/page.js` — regel 150: de bekende `ex.exercises?.name`-bug (quick win #1)
- `app/dashboard/coach/clients/[id]/plan/new/page.js` + `plan/[planId]/page.js` — builder, conditie-instructieveld
- `audit-bugs.md`, `audit-klant.md`, `audit-dashboard.md` — de drie rapporten
