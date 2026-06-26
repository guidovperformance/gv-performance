'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton, CalendlyButton , Analytics } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .systeem-intro { max-width:680px; margin:0 auto; text-align:center; }
  .systeem-intro p { font-size:16px; color:#aaa; line-height:1.8; margin-bottom:20px; }
  .systeem-intro p strong { color:var(--text); font-weight:700; }

  .pijler-block { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; padding:80px 60px; }
  .pijler-block:nth-child(even) { background:var(--dark2); }
  .pijler-block-reverse .pijler-text { order:2; }
  .pijler-block-reverse .pijler-aside { order:1; }
  .pijler-num { font-family:var(--display); font-size:14px; letter-spacing:3px; color:var(--orange); margin-bottom:16px; }
  .pijler-title { font-family:var(--display); font-size:clamp(32px,4vw,48px); letter-spacing:1px; color:var(--text); margin-bottom:20px; line-height:1; }
  .pijler-desc { font-size:16px; color:#aaa; line-height:1.8; }
  .pijler-aside {
    background:var(--dark3); border-left:3px solid var(--orange); padding:28px 32px;
  }
  .pijler-aside-label { font-size:10px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-bottom:12px; }
  .pijler-aside-text { font-size:14px; color:var(--muted); line-height:1.7; }

  @media (max-width: 768px) {
    .pijler-block { grid-template-columns:1fr; gap:32px; padding:60px 24px; }
    .pijler-block-reverse .pijler-text, .pijler-block-reverse .pijler-aside { order:initial; }
  }
`

const PIJLERS = [
  {
    id: 'periodisering',
    num: '01 — PERIODISERING',
    title: 'OPBOUW MET EEN DOEL',
    desc: 'Geen losse trainingen die toevallig na elkaar komen, maar een traject dat is opgebouwd in fases — elk met een eigen focus en intensiteit, welbewust gericht op een piekmoment. Of dat een selectie is, een wedstrijd, of gewoon de volgende stap in jouw ontwikkeling.',
    asideLabel: 'Zo zie je dit terug in jouw traject',
    asideText: 'In je trainingsplan zie je precies in welke week en fase je zit, met de bijbehorende focus en intensiteit. Geen verrassingen — je weet altijd waarom je deze week doet wat je doet, en hoe dat bijdraagt aan het grotere geheel.',
  },
  {
    id: 'data',
    num: '02 — DATA',
    title: 'BESLISSINGEN OP BASIS VAN FEITEN',
    desc: 'Een grondige nulmeting bij de start, periodieke voortgangsmetingen en herstelmonitoring. Beslissingen over jouw schema zijn gebaseerd op wat jouw lichaam daadwerkelijk laat zien — niet op aannames, een vast script, of wat "meestal werkt".',
    asideLabel: 'Zo zie je dit terug in jouw traject',
    asideText: 'Testresultaten, dagelijkse check-ins en sessielogs komen samen in je eigen dashboard. Je ziet je voortgang zelf terug — geen losse Excel-sheet, maar een doorlopend beeld van waar je staat.',
  },
  {
    id: 'mentaal',
    num: '03 — MENTAAL',
    title: 'CONSISTENTIE ALS HET ZWAAR WORDT',
    desc: 'Prestatie is net zo goed mentaal als fysiek. Vaste check-ins en eerlijke evaluaties houden je scherp — juist op de momenten dat motivatie alleen niet genoeg is en het traject vraagt om doorzettingsvermogen.',
    asideLabel: 'Zo zie je dit terug in jouw traject',
    asideText: 'Vaste evaluatiemomenten waarin we niet alleen naar cijfers kijken, maar ook naar hoe het traject voelt. Bijsturen waar nodig, vasthouden waar het werkt.',
  },
]

export default function MethodePage() {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <FloatButton />
      <SiteNav active="Methode" />

      <section className="page-hero">
        <div className="page-hero-eyebrow">De methode</div>
        <h1 className="page-hero-title">HET GV PERFORMANCE <span>SYSTEEM</span></h1>
        <p className="page-hero-desc">
          Geen kant-en-klaar schema van het internet, maar een systeem dat meegroeit met jouw voortgang. Drie pijlers vormen de basis van elk traject — of je nu een tactical athlete, topsporter of gedreven amateur bent.
        </p>
      </section>

      <section>
        <div className="systeem-intro">
          <div className="section-label fade-in" style={{ justifyContent: 'center' }}>Waarom een systeem</div>
          <h2 className="section-title fade-in delay-1" style={{ textAlign: 'center' }}>GENERIEKE SCHEMA&apos;S FALEN</h2>
          <p className="fade-in delay-1">
            Een schema van het internet werkt voor niemand specifiek — het werkt voor een gemiddelde dat niet bestaat. Het houdt geen rekening met jouw startpunt, jouw herstel, jouw kalender of jouw doel.
          </p>
          <p className="fade-in delay-2">
            <strong>Het GV Performance Systeem</strong> is geen schema, maar een manier van werken. Drie pijlers — periodisering, data en mentale coaching — zorgen ervoor dat elk traject zich aanpast aan jou, in plaats van andersom.
          </p>
        </div>
      </section>

      {PIJLERS.map((p, i) => (
        <section key={p.id} id={p.id} className={`pijler-block ${i % 2 === 1 ? 'pijler-block-reverse' : ''}`}>
          <div className="pijler-text fade-in">
            <div className="pijler-num">{p.num}</div>
            <h2 className="pijler-title">{p.title}</h2>
            <p className="pijler-desc">{p.desc}</p>
          </div>
          <div className="pijler-aside fade-in delay-1">
            <div className="pijler-aside-label">{p.asideLabel}</div>
            <div className="pijler-aside-text">{p.asideText}</div>
          </div>
        </section>
      ))}

      <section style={{ textAlign: 'center', background: 'var(--dark2)' }}>
        <div className="section-label fade-in" style={{ justifyContent: 'center' }}>Volgende stap</div>
        <h2 className="section-title fade-in delay-1">KLAAR VOOR EEN TRAJECT OP MAAT?</h2>
        <p style={{ fontSize: 16, color: '#aaa', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Plan een gratis kennismakingsgesprek van 30 minuten, of bekijk eerst de pakketten.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <CalendlyButton className="btn-primary fade-in delay-2" location="methode-cta" />
          <a href="/pakketten" className="btn-secondary fade-in delay-2">Bekijk pakketten</a>
        </div>
      </section>

      <SiteFooter />
      <Analytics />
    </>
  )
}
