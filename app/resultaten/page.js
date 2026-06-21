'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .transform-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .transform-card { background:var(--dark2); transition: border-color .25s, transform .25s; border:1px solid transparent; }
  .transform-card:hover { border-color: var(--orange); transform: translateY(-6px); }
  .transform-photo {
    aspect-ratio: 4/5; background:var(--dark3); display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:10px; border-bottom:1px solid var(--dark4);
  }
  .transform-photo-label { font-size:11px; letter-spacing:2px; color:var(--muted2); text-transform:uppercase; }
  .transform-body { padding:24px 26px; }
  .transform-name { font-family:var(--display); font-size:20px; letter-spacing:1px; color:var(--text); margin-bottom:6px; }
  .transform-goal { font-size:10px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-bottom:12px; }
  .transform-desc { font-size:14px; color:var(--muted); line-height:1.6; }

  .stats-strip { background:var(--dark2); border-top:1px solid rgba(212,168,87,0.1); border-bottom:1px solid rgba(212,168,87,0.1); padding:60px 60px; display:grid; grid-template-columns:repeat(4,1fr); gap:32px; text-align:center; }
  .stat-num { font-family:var(--display); font-size:clamp(36px,4vw,56px); color:var(--orange); letter-spacing:1px; line-height:1; margin-bottom:8px; }
  .stat-label { font-size:12px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; }

  @media (max-width: 768px) {
    .transform-grid { grid-template-columns:1fr; }
    .stats-strip { grid-template-columns:1fr 1fr; padding:40px 24px; }
  }
`

const transformaties = [
  { naam: 'Cliënt A', doel: 'Hyrox tijdverbetering', desc: '12 weken gericht op race-specifieke conditionering. Resultaat: persoonlijk record op race day.' },
  { naam: 'Cliënt B', doel: 'Tactical athlete selectie', desc: 'Volledige voorbereiding op fysieke selectietesten — fysiek en mentaal klaar binnen 16 weken.' },
  { naam: 'Cliënt C', doel: 'Topsport terugkeer', desc: 'Na een blessure terug naar het oude niveau via gefaseerde opbouw en periodisering.' },
  { naam: 'Cliënt D', doel: 'Lichaamssamenstelling', desc: 'Duurzame verandering in kracht en lichaamscompositie over een traject van 6 maanden.' },
  { naam: 'Cliënt E', doel: 'Loopcoaching 10km', desc: 'Van blessuregevoelig naar een sub-45 minuten 10km, met techniektraining en opbouwschema.' },
  { naam: 'Cliënt F', doel: 'Bedrijfstraining', desc: 'Teamtraject voor een lokaal bedrijf in Den Haag — conditie, teamspirit en meetbare progressie.' },
]

export default function ResultatenPage() {
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
      <SiteNav active="Resultaten" />

      <section className="page-hero">
        <div className="page-hero-eyebrow">Resultaten</div>
        <h1 className="page-hero-title">ECHTE <span>TRANSFORMATIES</span></h1>
        <p className="page-hero-desc">
          Elk traject is anders, maar het principe is altijd hetzelfde: een grondige analyse, een geperiodiseerd plan en consistente uitvoering. Hier zijn een aantal trajecten — foto's en details volgen per cliënt na toestemming.
        </p>
      </section>

      <div className="stats-strip">
        {[
          ['50+', 'Begeleide trajecten'],
          ['13+', 'Certificeringen'],
          ['24u', 'Reactietijd'],
          ['100%', 'Op maat gemaakt'],
        ].map(([num, label]) => (
          <div key={label} className="fade-in">
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="section-label fade-in">Trajecten</div>
        <h2 className="section-title fade-in delay-1">UITGELICHTE RESULTATEN</h2>
        <p className="section-intro fade-in delay-1">
          Onderstaande trajecten geven een beeld van de aanpak. Foto-/videomateriaal en concrete cijfers worden per cliënt toegevoegd zodra toestemming is verleend.
        </p>
        <div className="transform-grid">
          {transformaties.map((t, i) => (
            <div key={t.naam} className={`transform-card fade-in delay-${(i % 3) + 1}`}>
              <div className="transform-photo">
                <div className="transform-photo-label">Foto volgt</div>
              </div>
              <div className="transform-body">
                <div className="transform-name">{t.naam}</div>
                <div className="transform-goal">{t.doel}</div>
                <div className="transform-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', background: 'var(--dark2)' }}>
        <div className="section-label fade-in" style={{ justifyContent: 'center' }}>Volgende stap</div>
        <h2 className="section-title fade-in delay-1">JOUW TRANSFORMATIE START HIER</h2>
        <a href="/#contact" className="btn-primary fade-in delay-2">Plan je kennismaking</a>
      </section>

      <SiteFooter />
    </>
  )
}
