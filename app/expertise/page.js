'use client'
import React from 'react'
import { SITE_CSS, SiteNav, SiteFooter, FloatButton } from '../site-shared'

const QUALIFICATIES = [
  'Instructeur Fysieke Training & Sport (Defensie)',
  'KSS 3 — Nederlandse Boks Bond',
  'Basis Looptrainer 3 — Atletiek Unie',
  'MBO 4 Trainer / Coach',
  'Totaal Coach XXL (incl. mentaal)',
  'Overload A & B (TOP methode)',
  'Athletic Skills Model (ASM)',
  'Power Cycling A + B — Always Fit',
  'Xavier FIT A',
  'Atletiek Baan Assistent 2 — Atletiek Unie',
  'EHBO (actueel)',
  'Lifeguard (actueel)',
  'Interne Voedingscursus',
]

const CSS = `
  ${SITE_CSS}

  .pixel-hero {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 32px;
    padding: 110px 16px 48px;
    text-align: center;
    overflow: hidden;
    isolate: isolate;
  }
  .pixel-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 30%, rgba(212,168,87,0.10) 0%, transparent 60%),
      linear-gradient(to_right, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(to_bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: auto, 56px 56px, 56px 56px;
    pointer-events: none;
  }

  .glass-text {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: center;
    gap: 0.4em;
    line-height: 0.95;
    font-size: clamp(2.6rem, 9vw, 6.5rem);
    margin: 0 auto;
  }
  .glass-text .word-serif {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-weight: 500;
    color: var(--text);
    opacity: 0.92;
  }
  .glass-text .word-bold {
    font-family: var(--display);
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(120deg, var(--gold-bright) 0%, var(--orange) 35%, var(--gold-bright) 60%, var(--orange) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: heroShimmer 6s linear infinite;
  }
  @keyframes heroShimmer {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }

  .pixel-hero-desc {
    position: relative; z-index: 1;
    font-size: clamp(15px, 2vw, 18px);
    color: #aaa;
    max-width: 620px;
    margin: 0 auto;
    line-height: 1.8;
  }

  .pixel-hero-ctas {
    position: relative; z-index: 1;
    display: flex; flex-wrap: wrap; justify-content: center; gap: 14px;
  }

  .quals-label {
    position: relative; z-index: 1;
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--muted2); margin-bottom: 4px;
  }
  .quals-marquee {
    position: relative; z-index: 1;
    width: 100%;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to right, transparent, white 12%, white 88%, transparent);
    mask-image: linear-gradient(to right, transparent, white 12%, white 88%, transparent);
  }
  .quals-track {
    display: flex; width: max-content; gap: 14px;
    animation: qualsMarquee 38s linear infinite;
  }
  .qual-badge {
    flex-shrink: 0;
    background: var(--dark3);
    border: 1px solid rgba(212,168,87,0.2);
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0.5px;
    padding: 9px 16px;
    border-radius: 999px;
    white-space: nowrap;
  }
  @keyframes qualsMarquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .glass-text .word-bold { animation: none; }
    .quals-track { animation: none; }
  }

  @media (max-width: 768px) {
    .pixel-hero { padding: 90px 16px 40px; gap: 24px; }
  }
`

export default function ExpertisePage() {
  const badges = [...QUALIFICATIES, ...QUALIFICATIES]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <FloatButton />
      <SiteNav active="Expertise" />

      <section className="pixel-hero">
        <h1 className="glass-text">
          <span className="word-serif">Bewezen</span>
          <span className="word-bold">Expertise.</span>
        </h1>

        <p className="pixel-hero-desc">
          Tien jaar topsport, een opleiding bij het Korps Mariniers en dertien certificeringen verderop —
          dezelfde discipline en methodiek die Guido naar het hoogste niveau bracht, zet hij nu in voor jouw traject.
        </p>

        <div className="pixel-hero-ctas">
          <a href="/#contact" className="btn-primary">Plan je kennismaking</a>
          <a href="/#diensten" className="btn-secondary">Bekijk diensten</a>
        </div>

        <div className="quals-label">Kwalificaties &amp; certificeringen</div>
        <div className="quals-marquee">
          <div className="quals-track">
            {badges.map((q, i) => (
              <span key={i} className="qual-badge">{q}</span>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
