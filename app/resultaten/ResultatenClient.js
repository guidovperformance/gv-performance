'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton, EmptyState, usePublishedRows, SEGMENT_LABELS , Analytics } from '../site-shared'
import { TrendingUp } from 'lucide-react'

const CSS = `
  ${SITE_CSS}

  .transform-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:60px; border:2px solid var(--dark3); }
  .transform-card { background:var(--dark2); transition: border-color .25s, transform .25s; border:1px solid transparent; padding:28px 26px; }
  .transform-card:hover { border-color: var(--warm-border); transform: translateY(-6px); }
  .transform-name { font-family:var(--display); font-size:20px; letter-spacing:1px; color:var(--text); margin-bottom:6px; }
  .transform-goal { font-size:10px; letter-spacing:2px; color:var(--orange); text-transform:uppercase; margin-bottom:14px; }
  .transform-baseline-result { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .transform-baseline, .transform-result { font-size:13px; color:var(--muted); }
  .transform-result { color:var(--text); font-weight:700; }
  .transform-arrow { color:var(--orange); }
  .transform-weeks { font-size:11px; color:var(--muted2); letter-spacing:1px; text-transform:uppercase; }

  .stats-strip { background:var(--dark2); border-top:1px solid rgba(212,168,87,0.1); border-bottom:1px solid rgba(212,168,87,0.1); padding:60px 60px; display:grid; grid-template-columns:repeat(4,1fr); gap:32px; text-align:center; }
  .stat-num { font-family:var(--display); font-size:clamp(36px,4vw,56px); color:var(--orange); letter-spacing:1px; line-height:1; margin-bottom:8px; }
  .stat-label { font-size:12px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; }

  @media (max-width: 768px) {
    .transform-grid { grid-template-columns:1fr; }
    .stats-strip { grid-template-columns:1fr 1fr; padding:40px 24px; }
  }
`

export default function ResultatenPage() {
  const { rows: cases, loading } = usePublishedRows('case_results')
  // Zolang er nog geen echte case_results zijn, tonen we de bestaande
  // testimonial-cijfers hier ook als mini-case — beter dan een lege pagina
  // op een sectie die letterlijk "Echte Transformaties" heet.
  const { rows: testimonials, loading: testimonialsLoading } = usePublishedRows('testimonials')
  const showTestimonialFallback = !loading && cases.length === 0 && !testimonialsLoading && testimonials.length > 0

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [cases, testimonials])

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
          {!loading && cases.length === 0 && !showTestimonialFallback && (
            <EmptyState Icon={TrendingUp} text="Binnenkort delen we concrete trajecten en cijfers." />
          )}
          {showTestimonialFallback && testimonials.map((t, i) => (
            <div key={t.id} className={`transform-card fade-in delay-${(i % 3) + 1}`}>
              <div className="transform-name">{t.name}</div>
              <div className="transform-goal">{t.segment ? SEGMENT_LABELS[t.segment] : ''}{t.segment && t.role ? ' · ' : ''}{t.role}</div>
              {t.result_metric && (
                <div className="transform-baseline-result">
                  <span className="transform-result">{t.result_metric}</span>
                </div>
              )}
            </div>
          ))}
          {cases.map((c, i) => (
            <div key={c.id} className={`transform-card fade-in delay-${(i % 3) + 1}`}>
              <div className="transform-name">{c.client_label}</div>
              <div className="transform-goal">{c.segment ? SEGMENT_LABELS[c.segment] : ''}{c.segment && c.goal ? ' · ' : ''}{c.goal}</div>
              {(c.baseline || c.result) && (
                <div className="transform-baseline-result">
                  {c.baseline && <span className="transform-baseline">{c.baseline}</span>}
                  {c.baseline && c.result && <span className="transform-arrow">→</span>}
                  {c.result && <span className="transform-result">{c.result}</span>}
                </div>
              )}
              {c.duration_weeks && <div className="transform-weeks">{c.duration_weeks} weken</div>}
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
      <Analytics />
    </>
  )
}
