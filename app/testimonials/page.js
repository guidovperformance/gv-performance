'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .reviews-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-top:60px; }
  .review-card {
    background:var(--dark2); padding:40px 36px; border-left:3px solid var(--orange-dim);
    transition: border-color .25s, transform .25s; min-height:220px;
    display:flex; flex-direction:column; justify-content:space-between;
  }
  .review-card:hover { border-color:var(--orange); transform:translateY(-4px); }
  .review-placeholder { display:flex; align-items:center; justify-content:center; flex:1; flex-direction:column; gap:10px; }
  .review-placeholder-text { font-size:13px; color:var(--muted2); letter-spacing:1px; font-style:italic; text-align:center; }
  .review-stars { color: var(--orange); font-size:14px; letter-spacing:2px; margin-bottom: 16px; }

  @media (max-width: 768px) { .reviews-grid { grid-template-columns:1fr; } }
`

export default function TestimonialsPage() {
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
      <SiteNav active="Reviews" />

      <section className="page-hero">
        <div className="page-hero-eyebrow">Reviews</div>
        <h1 className="page-hero-title">WAT CLIËNTEN <span>ZEGGEN</span></h1>
        <p className="page-hero-desc">
          Reviews worden hier toegevoegd zodra cliënten toestemming geven om hun ervaring te delen.
        </p>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="reviews-grid">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="review-card fade-in">
              <div className="review-stars">★★★★★</div>
              <div className="review-placeholder">
                <div className="review-placeholder-text">Review volgt binnenkort</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', background: 'var(--dark2)' }}>
        <div className="section-label fade-in" style={{ justifyContent: 'center' }}>Word ook een review</div>
        <h2 className="section-title fade-in delay-1">START JOUW EIGEN TRAJECT</h2>
        <a href="/#contact" className="btn-primary fade-in delay-2">Plan je kennismaking</a>
      </section>

      <SiteFooter />
    </>
  )
}
