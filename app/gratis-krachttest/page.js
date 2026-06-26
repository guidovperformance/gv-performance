'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton, EmailCapture } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .lp-grid { display:grid; grid-template-columns:1.1fr 0.9fr; gap:60px; align-items:start; padding-top:0; }
  .lp-grid > div { min-width:0; }
  .lp-benefits { display:flex; flex-direction:column; gap:16px; margin-top:28px; }
  .lp-benefit { display:flex; align-items:flex-start; gap:12px; min-width:0; }
  .lp-benefit-icon { color:var(--orange); font-size:16px; flex-shrink:0; line-height:1.5; }
  .lp-benefit-text { font-size:15px; color:#ccc; line-height:1.6; flex:1 1 auto; min-width:0; }
  .lp-form-card { background:var(--dark2); border:1px solid rgba(212,168,87,0.2); padding:36px 32px; }
  .lp-form-card-title { font-family:var(--display); font-size:20px; letter-spacing:1px; color:var(--text); margin-bottom:8px; }
  .lp-form-card-sub { font-size:13px; color:var(--muted); margin-bottom:24px; }

  @media (max-width: 768px) {
    .lp-grid { grid-template-columns:1fr; gap:32px; }
  }
`

export default function GratisKrachttestPage() {
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
      <SiteNav />

      <section className="page-hero">
        <div className="page-hero-eyebrow">Gratis download</div>
        <h1 className="page-hero-title">PRE-SELECTIE <span>KRACHTTEST</span> + NORMEN</h1>
        <p className="page-hero-desc">
          Dezelfde test die ik gebruik om te bepalen waar iemand fysiek staat ten opzichte van
          selectie-eisen bij Defensie, politie en brandweer — gratis als PDF, direct in je mail.
        </p>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="lp-grid">
          <div className="fade-in">
            <div className="section-label">Wat je krijgt</div>
            <h2 className="section-title">WEET PRECIES WAAR JE STAAT</h2>
            <div className="lp-benefits">
              {[
                'De exacte testprotocollen die ook bij de echte selectie worden gebruikt.',
                'Normtabellen per onderdeel — standaard, goed, elite en pro-niveau.',
                'Een duidelijk beeld van je sterke punten en waar nog winst te halen is.',
                'Geen verplichtingen — gewoon een eerlijke nulmeting om mee te beginnen.',
              ].map(text => (
                <div key={text} className="lp-benefit">
                  <span className="lp-benefit-icon">✓</span>
                  <span className="lp-benefit-text">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-form-card fade-in delay-1">
            <div className="lp-form-card-title">Download de PDF</div>
            <div className="lp-form-card-sub">Gratis · direct in je mail · geen spam</div>
            <EmailCapture source="gratis-krachttest-pagina" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
