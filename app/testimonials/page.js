'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton, TestimonialCard, EmptyState, usePublishedRows } from '../site-shared'

const CSS = `
  ${SITE_CSS}

  .reviews-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-top:60px; }

  @media (max-width: 768px) { .reviews-grid { grid-template-columns:1fr; } }
`

export default function TestimonialsPage() {
  const { rows: testimonials, loading } = usePublishedRows('testimonials')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [testimonials])

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
          {!loading && testimonials.length === 0 && (
            <EmptyState text="Binnenkort delen we reviews van cliënten." />
          )}
          {testimonials.map(t => (
            <div key={t.id} className="fade-in">
              <TestimonialCard t={t} />
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
