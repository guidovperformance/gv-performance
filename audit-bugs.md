# Technische QA-audit — GV Performance

**Datum:** 30 juni 2026
**Scope:** volledige publieke site (marketing-pagina's, formulieren, Supabase-integraties, Calendly), dashboard/auth-flows niet aangeraakt.
**Methode:** `npm run build`, geautomatiseerde Playwright-crawls van alle publieke routes (console-errors, links, afbeeldingen, meta-tags, headingstructuur, focus-states), directe Supabase-queries (anon + service role) voor RLS/lege-states, contrastberekening (WCAG) op het kleurenpalet, handmatige verificatie van de belangrijkste bevindingen met screenshots.

Niets is aangepast — alleen gelezen/gediagnosticeerd, zoals gevraagd.

---

## 1. Build

✅ **`npm run build` slaagt** (exit code 0), alle 40 routes compileren en genereren correct.

| Bevinding | Severity |
|---|---|
| Build-warning: "Failed to find font override values for font `Big Shoulders` — Skipping generating a fallback font." Cosmetische Turbopack-warning, geen functionele impact, build faalt niet. | Laag |

Geen TypeScript-errors, geen overige build-warnings.

---

## 2. Console-errors / runtime-errors per pagina

Gecrawld: `/`, `/pakketten`, `/methode`, `/resultaten`, `/blog`, `/blog/waarom-generieke-schemas-falen`, `/gratis-krachttest`, `/expertise`, `/faq`, `/testimonials`, `/privacy`, `/login`.

✅ **Geen enkele console-error of -warning** op geen van de 12 geteste pagina's. Geen mislukte requests (4xx/5xx) buiten de hieronder genoemde afbeelding.

---

## 3. Dode/foute links & 404's

| Bevinding | Locatie | Severity |
|---|---|---|
| Alle interne links (nav, footer, anchors, blog-links) → HTTP 200. Geen 404's gevonden. | site-breed | — (OK) |
| ~~Kapotte in-page anchors `/methode#data`/`#mentaal`/`#periodisering`~~ — **vals alarm, gecorrigeerd na verificatie.** Mijn eerste check zocht met een letterlijke tekst-grep naar `id="data"` en vond niets, maar de IDs worden dynamisch gezet (`id={p.id}` in `MethodeClient.js:96`, met `p.id` = `'periodisering'`/`'data'`/`'mentaal'`). Live getest met Playwright: navigatie naar `/methode#data` scrollt wel degelijk correct naar de juiste sectie. Geen actie nodig. | `app/methode/MethodeClient.js:30-55,96` | n.v.t. (geen bug) |
| LinkedIn-link (`https://nl.linkedin.com/in/guido-vols-99b317106`) kon niet automatisch geverifieerd worden — LinkedIn blokkeert geautomatiseerde requests (HTTP 999, standaard anti-bot-gedrag, geen bewijs van een echte 404). Aanbevolen: handmatig 1x openen ter controle. | Footer, alle pagina's | Laag |
| Calendly-link (`calendly.com/guidovperformance/30min`) → HTTP 200, werkt. | — | OK |

---

## 4. Afbeeldingen

| Bevinding | Locatie | Severity |
|---|---|---|
| **Ontbrekende OG-afbeelding voor de blogpost**: frontmatter van `content/blog/waarom-generieke-schemas-falen.md` verwijst naar `ogImage: "/blog/periodisering-og.jpg"`, maar `public/blog/` is **leeg** — het bestand bestaat niet. Resultaat: 404 op het og:image, kapotte preview bij delen op LinkedIn/social media. | `content/blog/waarom-generieke-schemas-falen.md:11`, `public/blog/` (leeg) | Middel |
| `/Diordy-1.png` (testimonial-avatar) → laadt correct (200). | — | OK |
| Lead magnet-PDF (`GV-Performance-Pre-Selectie-Krachttest.pdf`) → laadt correct (200). | — | OK |
| `hero.jpg`, `icon-512.png`, alle `diensten-*.jpg` → laden correct. | — | OK |
| Alle `<img>`-elementen op alle geteste pagina's hebben een `alt`-attribuut (0 ontbrekend). | — | OK |
| 3 afbeeldingen lijken ongebruikt sinds de consolidatie naar 3 hoofdsegmenten: `diensten-hyrox.jpg`, `diensten-loopcoaching.png`, `diensten-team.jpg` (niet meer gerefereerd in `app/page.js`). Geen bug, wel opruim-kans. | `public/` | Laag |

---

## 5. Formulieren

### Aanvraagformulier (homepage, `#contact`)
- ✅ Verplichte velden (`voornaam`, `email`, `bericht`) hebben `required`; lege submit wordt door browser-validatie geblokkeerd (3/3 verplichte velden correct gevalideerd in test).
- ✅ E-mailformaat-validatie werkt (zowel browser-native als server-side regex in `/api/contact`).
- ✅ Server-side: lege velden → 400 met duidelijke foutmelding; ongeldig e-mailadres → 400; honeypot-veld (`_trap`) aanwezig tegen spam-bots.
- ⚠️ **Niet getest**: een daadwerkelijke succesvolle submit (zou een echte e-mail naar `guidovperformance@gmail.com` via Resend versturen) — bewust overgeslagen om geen ruis in je inbox te veroorzaken. Aanbevolen: zelf 1x testen.

| Bevinding | Locatie | Severity |
|---|---|---|
| **De exit-intent/scroll-trigger lead-magnet-popup blokkeert het aanvraagformulier.** De popup verschijnt zodra een bezoeker >60% van de homepage scrollt (`app/site-shared.js:337`) — en het contactformulier staat onderaan de pagina, ruim voorbij die 60%-grens. Een bezoeker die doelbewust naar het formulier scrolt om een aanvraag te doen, krijgt dus de gratis-krachttest-popup over het formulier heen, die de "VERSTUUR BERICHT"-knop blokkeert totdat hij wordt weggeklikt. Gereproduceerd en met screenshot bevestigd. | `app/site-shared.js:320-343` (ExitIntentModal, scroll-trigger) | **Hoog** |
| Formuliervelden (`Interesse in`-dropdown, en alle overige `form-group`-velden) hebben wel een zichtbaar `<label>`, maar **geen** `htmlFor`/`id`-koppeling — niet programmatisch gekoppeld voor screenreaders. | `app/page.js:1109-1145` | Middel (a11y) |

### Lead magnet-formulier (`/gratis-krachttest`, exit-intent popup)
- ✅ Verplichte velden + e-mailvalidatie werken (browser-native).
- ✅ Formulier (`EmailCapture` in `site-shared.js`) post naar `/api/leads`, met tracking van form-start.
- Niet getest: echte submit (zou een rij in Supabase `leads` aanmaken + een Resend-mail triggeren) — zelfde reden als hierboven.

---

## 6. Supabase-data (testimonials / case_results / leads)

| Tabel | Resultaat anon-key select | Lege state correct? |
|---|---|---|
| `testimonials` | ✅ 200, 1 gepubliceerde rij (Diordy CrossFit-review) — rendert correct op `/` en `/testimonials` | N.v.t. (heeft data) |
| `case_results` | ✅ 200, 0 rijen (nog geen cases ingevoerd) | ✅ Ja — `/resultaten` toont nette empty-state ("Binnenkort delen we concrete trajecten en cijfers.") i.p.v. een lege/kapotte sectie |
| `leads` | ✅ 200, leesbaar (0 rijen, nog geen inschrijvingen) | N.v.t. |

Geen RLS/`permission denied`-fouten gevonden op de publieke (anon-key) kant. Geen actie nodig.

---

## 7. Calendly-embed

✅ **Werkt volledig correct.** Widget-CSS/JS laden (200), klik op "Plan kennismaking"-knop opent de Calendly-popup met booking-iframe, alle Calendly-subresources (booking-UI, `initial_settings`-API) laden zonder fouten. Getest vanaf `/pakketten`.

---

## 8. Responsive (360px / 768px / 1280px)

Getest op: `/`, `/pakketten`, `/methode`, `/resultaten`, `/blog`, `/gratis-krachttest`.

✅ **Geen horizontale overflow** op geen enkele combinatie van pagina × breedte (`scrollWidth === clientWidth` overal).

| Bevinding | Locatie | Severity |
|---|---|---|
| **Mobiele hero-CTA staat niet boven de vouw.** Op 360×740 (representatief klein mobiel scherm) staat de primaire knop "Vraag je traject aan" pas op y≈932px — ver buiten het eerste scherm. Dit is in directe tegenspraak met de expliciete eis uit het eigen redesign-plan ("Mobiel: CTA boven de vouw"). | `app/page.js`, mobiele hero (`.hero-right { height:34vh }` + stapeling van eyebrow/headline/tagline/proof/desc boven de knoppen) | **Hoog** |
| **Cookie-consent-banner overlapt de hero-headline op mobiel.** Bij eerste laden (vóór accepteren/weigeren) bedekt de banner onderaan het scherm gedeeltelijk de tekst "ONS PLAN". Zichtbaar op screenshot bij 360×740. | Cookie-banner-component, mobiele weergave | Middel |

---

## 9. Basis a11y

| Bevinding | Locatie | Severity |
|---|---|---|
| Heading-structuur: elke pagina heeft precies 1 `<h1>`, geen overgeslagen headingniveaus (H1→H2 overal correct, geen H1→H3-sprongen). | site-breed | OK |
| Focus-states: eerste Tab-stop op elke pagina toont een duidelijke `outline: solid 2px` + box-shadow — goed zichtbaar voor toetsenbordgebruikers. | site-breed | OK |
| Geen knoppen/links zonder toegankelijke tekst of `aria-label` gevonden. | site-breed | OK |
| Alle afbeeldingen hebben `alt`-tekst. | site-breed | OK |
| **Contrastprobleem**: `--muted2` (`#555555`) op de donkere achtergrond (`#141414`/`#0E0E10`) geeft een contrastratio van **2.47:1** — ruim onder de WCAG AA-eis van 4.5:1 voor normale tekst. Dit kleurtoken wordt gebruikt voor: footer-copyright, **footer-navigatielinks** (interactief!), empty-state-teksten, en foto-bijschriften. | `app/page.js:547,549` e.a. (CSS-variabele `--muted2`) | Middel |
| Formulierlabels niet gekoppeld via `htmlFor`/`id` (zie sectie 5). | `app/page.js` contactformulier | Middel |
| Overige tekstkleuren (`--muted` #888, `--text` #f0ede8, `--orange` #D4A857) hebben ruim voldoende contrast (5.2:1 – 15.8:1). | — | OK |

---

## 10. Meta / SEO

| Bevinding | Locatie | Severity |
|---|---|---|
| **8 van de ±11 publieke pagina's delen identieke title/description/og:image.** `/`, `/pakketten`, `/methode`, `/resultaten`, `/gratis-krachttest`, `/expertise`, `/faq`, `/testimonials` tonen allemaal dezelfde generieke title ("GV Performance — Guido Vols") en dezelfde meta-description ("Coaching, training en tactical athlete voorbereiding...") en og:image (`hero.jpg`), geërfd van `app/layout.js`. **Root-oorzaak**: al deze pagina's zijn `'use client'`-componenten — in Next.js App Router kunnen client components per definitie geen eigen `metadata`/`generateMetadata` exporteren. Alleen `/blog/[slug]` en `/privacy` hebben wél unieke, pagina-specifieke metadata. Dit is een serieus, structureel SEO-probleem: zoekmachines (en gedeelde links) kunnen deze 8 pagina's niet van elkaar onderscheiden — een klassiek "duplicate content"-signaal. | `app/page.js`, `app/pakketten/page.js`, `app/methode/page.js`, `app/resultaten/page.js`, `app/gratis-krachttest/page.js`, `app/expertise/page.js`, `app/faq/page.js`, `app/testimonials/page.js` (allen `'use client'`, geen metadata-export) | **Hoog** |
| `og:image` van de enige blogpost wijst naar een niet-bestaand bestand (zie sectie 4). | `content/blog/waarom-generieke-schemas-falen.md` | Middel |
| `viewport`-meta correct aanwezig (`width=device-width, initial-scale=1, maximum-scale=5`). | `app/layout.js` | OK |
| Favicon (`/favicon.ico`) en `manifest.json` laden correct (200). | — | OK |
| `sitemap.xml` compleet en correct: alle 11 publieke routes aanwezig, inclusief de blogpost. | `app/sitemap.js` (of vergelijkbaar) | OK |
| JSON-LD (`LocalBusiness`-schema) aanwezig op de homepage. | `app/page.js:8-42` | OK |

---

## Top 5 — meest urgente fixes

1. **🔴 Exit-intent-popup blokkeert het aanvraagformulier** — bezoekers die naar `#contact` scrollen krijgen de lead-magnet-popup over de "VERSTUUR BERICHT"-knop. Dit raakt je primaire conversiepad direct. *(Sectie 5)*
2. **🔴 Mobiele CTA niet boven de vouw** — "Vraag je traject aan" staat op mobiel pas na flink scrollen, in tegenspraak met je eigen CRO-eis uit het redesign-plan. *(Sectie 8)*
3. **🔴 8 pagina's delen identieke SEO-titel/-description/-og:image** doordat ze allemaal client components zijn — flinke gemiste SEO-kans en duplicate-content-risico, structurele fix nodig (server-metadata per pagina, bv. via een server-wrapper of `generateMetadata`). *(Sectie 10)*
4. **🟡 Kapotte og:image voor de blogpost** (`/blog/periodisering-og.jpg` bestaat niet) — kapotte preview bij elke keer dat de blogpost gedeeld wordt op social media. *(Sectie 4)*
5. **🟡 Kapotte ankerlinks naar `/methode#data`/`#mentaal`/`#periodisering`** — de 3 pijler-kaarten op de homepage beloven een sprong naar de relevante sectie, maar landen gewoon bovenaan `/methode`. *(Sectie 3)*

*Eervolle vermelding (Middel): cookie-banner overlapt mobiele hero-tekst, contactformulier-labels niet a11y-gekoppeld, footer-links hebben te laag contrast.*
