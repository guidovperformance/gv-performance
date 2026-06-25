'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .methode-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .methode-card { background:var(--dark2); padding:44px 32px; transition: border-color .25s, transform .25s; border:1px solid transparent; }
  .methode-card:hover { border-color:var(--orange); transform:translateY(-4px); }
  .methode-num { font-family:var(--display); font-size:13px; letter-spacing:3px; color:var(--orange); margin-bottom:16px; }
  .methode-title { font-family:var(--display); font-size:26px; letter-spacing:1px; color:var(--text); margin-bottom:12px; }
  .methode-desc { font-size:14px; color:var(--muted); line-height:1.7; }

  @media (max-width: 768px) {
    .methode-grid { grid-template-columns:1fr; }
  }
`

const PIJLERS = [
  { num:'01', title:'PERIODISERING', desc:'Elk traject is opgebouwd in fases, afgestemd op jouw doel en kalender. Geen losse trainingen, maar een opbouw die welbewust naar een piekmoment toewerkt — of dat een selectie, wedstrijd of seizoen is.' },
  { num:'02', title:'DATA', desc:'Een grondige nulmeting, periodieke voortgangsmetingen en herstelmonitoring (HRV, rusthartslag, 1RM-progressie). Beslissingen over jouw schema zijn gebaseerd op wat je lichaam laat zien — niet op aannames of een vast script.' },
  { num:'03', title:'MENTAAL', desc:'Prestatie is net zo goed mentaal als fysiek. Vaste check-ins, eerlijke evaluaties en mentale coaching houden je scherp en consistent — juist op de momenten dat het zwaar wordt.' },
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
        <h1 className="page-hero-title">PERIODISERING <span>·</span> DATA <span>·</span> MENTAAL</h1>
        <p className="page-hero-desc">
          Geen kant-en-klaar schema, maar een systeem dat meegroeit met jouw voortgang. Drie pijlers vormen de basis van elk traject, of je nu een tactical athlete, topsporter of gedreven amateur bent.
        </p>
      </section>

      <section>
        <div className="section-label fade-in">De drie pijlers</div>
        <h2 className="section-title fade-in delay-1">HOE DE METHODE WERKT</h2>
        <div className="methode-grid">
          {PIJLERS.map((p, i) => (
            <div key={p.num} className={`methode-card fade-in delay-${i + 1}`}>
              <div className="methode-num">{p.num}</div>
              <div className="methode-title">{p.title}</div>
              <div className="methode-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', background: 'var(--dark2)' }}>
        <div className="section-label fade-in" style={{ justifyContent: 'center' }}>Volgende stap</div>
        <h2 className="section-title fade-in delay-1">KLAAR VOOR EEN TRAJECT OP MAAT?</h2>
        <a href="/#contact" className="btn-primary fade-in delay-2">Vraag je traject aan</a>
      </section>

      <SiteFooter />
    </>
  )
}
