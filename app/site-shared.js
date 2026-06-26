'use client'
import React from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { GA_MEASUREMENT_ID, trackEvent, hasConsent, setConsent, getConsent } from '@/lib/analytics'
import { MessageCircle, CheckCircle2 } from 'lucide-react'

export const CALENDLY_URL = 'https://calendly.com/guidovperformance/30min'

export const SITE_CSS = `
  :root {
    --orange: #D4A857;
    --orange-dim: rgba(212,168,87,0.15);
    --dark:  #0E0E10;
    --dark2: #161412;
    --dark3: #1E1B18;
    --dark4: #282420;
    --warm-border: #3A352F;
    --text:  #F0EEE8;
    --muted: #888;
    --muted2: #555;
    --display: var(--font-oswald), Impact, sans-serif;
    --body:    var(--font-barlow), sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--dark);
    color: var(--text);
    font-family: var(--body);
    font-size: 17px;
    line-height: 1.65;
    overflow-x: hidden;
    overflow-y: visible;
    padding-top: 78px; /* compenseert de nu altijd-vaste (position:fixed) nav */
  }

  /* position:fixed i.p.v. sticky — sticky bleek onbetrouwbaar in sommige browsers */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 60px; border-bottom: 1px solid rgba(212,168,87,0.12);
    background: var(--dark); position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  }
  .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; flex-shrink:0; }
  .nav-logo-text { font-family:var(--display); font-size:22px; letter-spacing:3px; color:var(--text); line-height:1; }
  .nav-logo-sub  { font-family:var(--body); font-size:10px; letter-spacing:3px; color:var(--orange); margin-top:2px; }
  .nav-cta {
    background:var(--orange); color:#000 !important;
    padding:10px 22px; font-weight:700; letter-spacing:1px !important;
    font-family:var(--body); font-size:13px; text-transform:uppercase;
    text-decoration:none; border-radius:4px; transition: background .2s;
  }
  .nav-cta:hover { background:var(--gold-bright, #E8C77E); }
  @media (max-width: 480px) { .nav-cta-desktop { display: none; } }

  /* GRADIENT CIRCLE ICON NAV — rechtstreeks in de balk, geen hamburger meer */
  .nav-icons {
    display: flex; align-items: center; gap: 10px;
    overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .nav-icons::-webkit-scrollbar { display: none; }
  .nav-icon-item {
    position: relative; width: 44px; height: 44px; border-radius: 50%;
    background: var(--dark2); border: 1px solid rgba(212,168,87,0.2);
    display: flex; align-items: center; justify-content: center;
    text-decoration: none; overflow: hidden; flex-shrink: 0;
    transition: width .4s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-icon-item:hover, .nav-icon-item:focus-visible {
    width: 148px;
  }
  .nav-icon-item-bg {
    position: absolute; inset: 0; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-bright, #E8C77E), var(--orange));
    opacity: 0; transition: opacity .3s ease, border-radius .4s ease;
  }
  .nav-icon-item:hover .nav-icon-item-bg,
  .nav-icon-item:focus-visible .nav-icon-item-bg { opacity: 1; border-radius: 22px; }
  .nav-icon-item-icon {
    position: relative; z-index: 1; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--orange); transition: transform .3s ease, opacity .3s ease;
  }
  .nav-icon-item-icon svg { width: 17px; height: 17px; }
  .nav-icon-item:hover .nav-icon-item-icon,
  .nav-icon-item:focus-visible .nav-icon-item-icon { transform: scale(0); opacity: 0; }
  .nav-icon-item-label {
    position: absolute; color: #000; font-family: var(--body); font-weight: 700;
    font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
    opacity: 0; transform: scale(0.6); white-space: nowrap; z-index: 2;
    transition: opacity .3s ease .08s, transform .3s ease .08s;
  }
  .nav-icon-item:hover .nav-icon-item-label,
  .nav-icon-item:focus-visible .nav-icon-item-label { opacity: 1; transform: scale(1); }
  @media (prefers-reduced-motion: reduce) {
    .nav-icon-item, .nav-icon-item-bg, .nav-icon-item-icon, .nav-icon-item-label { transition: none; }
  }

  .nav-mobile-cta {
    margin-top: 8px; background: var(--orange); color: #000 !important;
    text-align: center; border-radius: 10px; font-family: var(--body) !important;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    text-decoration: none; padding: 16px !important; font-size: 14px !important;
    display: block; flex-shrink: 0;
  }
  section { padding:100px 60px; }
  .section-label {
    font-size:10px; letter-spacing:4px; color:var(--orange); text-transform:uppercase;
    margin-bottom:14px; display:flex; align-items:center; gap:10px;
  }
  .section-label::before { content:''; display:block; width:24px; height:2px; background:var(--orange); }
  .section-title {
    font-family:var(--display); font-size:clamp(42px,5vw,68px);
    letter-spacing:0px; line-height:0.95; margin-bottom:24px;
    overflow-wrap:break-word; word-break:break-word;
  }
  .section-intro { font-size:16px; color:#aaa; line-height:1.8; max-width:620px; margin-bottom:24px; }

  .page-hero {
    padding: 140px 60px 80px; text-align:center; position:relative; overflow:hidden;
  }
  .page-hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 50% 0%, rgba(212,168,87,0.08) 0%, transparent 60%);
    pointer-events:none;
  }
  .page-hero-eyebrow {
    font-size:11px; letter-spacing:4px; color:var(--orange);
    text-transform:uppercase; margin-bottom:20px;
    display:flex; align-items:center; justify-content:center; gap:12px;
  }
  .page-hero-eyebrow::before, .page-hero-eyebrow::after { content:''; display:block; width:32px; height:2px; background:var(--orange); }
  .page-hero-title {
    font-family:var(--display); font-size:clamp(48px,6vw,84px);
    line-height:0.95; letter-spacing:0px; color:var(--text); margin-bottom:20px;
    overflow-wrap:break-word; word-break:break-word;
  }
  .page-hero-title span { color:var(--orange); }
  .page-hero-desc { font-size:16px; color:#aaa; max-width:560px; margin:0 auto; line-height:1.8; }

  /* ── FOTOGRAFIE-GRADE: donker, contrastrijk, consistent over alle bronnen ── */
  .photo-grade { filter: contrast(1.12) brightness(0.93) saturate(0.9); }

  .btn-primary {
    background:var(--orange); color:#000; font-family:var(--body);
    font-weight:700; font-size:13px; letter-spacing:2px; text-transform:uppercase;
    padding:16px 36px; text-decoration:none; display:inline-block;
    transition: background .2s, transform .15s;
    border: none; cursor: pointer;
  }
  .btn-primary:hover { background:#C99540; transform:translateY(-1px); }

  .btn-secondary {
    border:1px solid var(--muted2); color:var(--text); font-family:var(--body);
    font-size:13px; letter-spacing:2px; text-transform:uppercase;
    padding:16px 36px; text-decoration:none; display:inline-block;
    transition:border-color .2s, color .2s; cursor: pointer;
  }
  .btn-secondary:hover { border-color:var(--text); }

  footer {
    background:var(--dark); border-top:1px solid rgba(212,168,87,0.1);
    padding:40px 60px; display:flex; align-items:center;
    justify-content:space-between; flex-wrap:wrap; gap:16px;
  }
  .footer-copy  { font-size:12px; color:var(--muted2); letter-spacing:1px; }
  .footer-links { display:flex; gap:24px; }
  .footer-links a { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted2); text-decoration:none; transition:color .2s; }
  .footer-links a:hover { color:var(--orange); }

  .fade-in {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
  .fade-in.delay-1 { transition-delay: 0.1s; }
  .fade-in.delay-2 { transition-delay: 0.2s; }
  .fade-in.delay-3 { transition-delay: 0.3s; }

  .page-hero-eyebrow, .page-hero-title, .page-hero-desc {
    opacity: 0; transform: translateY(20px);
    animation: heroIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .page-hero-eyebrow { animation-delay: 0.05s; }
  .page-hero-title   { animation-delay: 0.15s; }
  .page-hero-desc    { animation-delay: 0.25s; }
  @keyframes heroIn { to { opacity: 1; transform: translateY(0); } }

  @media (prefers-reduced-motion: reduce) {
    .fade-in, .page-hero-eyebrow, .page-hero-title, .page-hero-desc {
      animation: none !important; transition: none !important;
      opacity: 1 !important; transform: none !important;
    }
  }

  .float-btn {
    position: fixed; bottom: 32px; right: 32px;
    background: var(--orange); color: #000; font-family: var(--body);
    font-weight: 700; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    padding: 14px 24px; text-decoration: none; z-index: 999;
    box-shadow: 0 4px 24px rgba(212,168,87,0.4);
    transition: transform .2s, box-shadow .2s, background .2s, opacity .3s ease;
    display: flex; align-items: center; gap: 8px;
  }
  .float-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(212,168,87,0.55); background: #C99540; }
  .float-btn-pulse {
    width: 8px; height: 8px; background: #000; border-radius: 50%; flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }

  @media (max-width: 768px) {
    body { padding-top: 112px; } /* mobiele nav is 2 regels hoog */
    nav { padding: 14px 16px; flex-wrap: wrap; row-gap: 10px; }
    .nav-logo { gap: 10px; }
    .nav-logo svg { width: 28px; height: 26px; }
    .nav-logo-text { font-size: 17px; letter-spacing: 1.5px; }
    .nav-logo-sub { display: none; }
    .nav-actions { width: 100%; justify-content: flex-start !important; }
    .nav-icon-item { width: 40px; height: 40px; }
    .nav-icon-item:hover, .nav-icon-item:focus-visible { width: 40px; }
    section { padding:60px 24px; }
    .page-hero { padding:110px 24px 60px; }
    footer { padding:30px 24px; flex-direction:column; align-items:flex-start; }
    .footer-links { flex-wrap:wrap; gap:14px 20px; }
    .float-btn { bottom:20px; right:16px; left:16px; justify-content:center; }
  }

  @media (max-width: 400px) {
    .section-title { font-size:clamp(28px,7.5vw,68px); }
    .page-hero-title { font-size:clamp(28px,7.5vw,84px); }
  }

  /* ── TESTIMONIAL CARD (data-gedreven) ── */
  .testi-card {
    background:var(--dark2); padding:36px 32px;
    border-left:3px solid var(--orange-dim);
    transition: border-color .25s, transform .25s;
    display:flex; flex-direction:column; justify-content:space-between; gap:24px;
  }
  .testi-card:hover { border-color:var(--warm-border); transform:translateY(-4px); }
  .testi-quote { font-size:15px; color:#ccc; line-height:1.7; }
  .testi-footer { display:flex; align-items:center; gap:14px; }
  .testi-avatar { width:48px; height:48px; border-radius:50%; overflow:hidden; flex-shrink:0; background:var(--dark3); }
  .testi-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
  .testi-name { font-family:var(--display); font-size:15px; letter-spacing:1px; color:var(--text); }
  .testi-role { font-size:12px; color:var(--muted); margin-top:2px; }
  .testi-metric { font-size:11px; color:var(--orange); letter-spacing:1px; margin-top:4px; }
  .testi-readmore { display:inline-block; font-size:12px; color:var(--orange); text-decoration:none; border-bottom:1px solid var(--orange); padding-bottom:2px; }
  .testi-readmore:hover { color:var(--text); border-color:var(--text); }

  /* ── EMPTY STATE ── */
  .empty-state {
    display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px;
    padding:48px 24px; grid-column:1/-1;
  }
  .empty-state-icon { font-size:28px; opacity:0.3; }
  .empty-state-text { font-size:13px; color:var(--muted2); letter-spacing:1px; font-style:italic; text-align:center; }

  /* ── COOKIE CONSENT ── */
  .cookie-banner {
    position:fixed; left:0; right:0; bottom:0; z-index:1001;
    background:var(--dark2); border-top:1px solid rgba(212,168,87,0.25);
    padding:18px 24px; display:flex; align-items:center; justify-content:space-between;
    gap:20px; flex-wrap:wrap;
  }
  .cookie-banner-text { font-size:13px; color:var(--muted); line-height:1.6; max-width:640px; }
  .cookie-banner-text a { color:var(--orange); text-decoration:underline; }
  .cookie-banner-actions { display:flex; gap:10px; flex-shrink:0; }
  .cookie-banner-decline {
    background:none; border:1px solid var(--muted2); color:var(--text);
    font-family:var(--body); font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:10px 18px; cursor:pointer;
  }
  .cookie-banner-accept {
    background:var(--orange); border:none; color:#000;
    font-family:var(--body); font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase;
    padding:10px 18px; cursor:pointer;
  }
  @media (max-width: 600px) {
    .cookie-banner { padding:16px; flex-direction:column; align-items:stretch; text-align:center; }
    .cookie-banner-actions { justify-content:center; }
  }

  /* ── LEAD CAPTURE (gratis krachttest) ── */
  .lead-form { display:flex; flex-direction:column; gap:14px; }
  .lead-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .lead-form-row > input, .lead-form-row-compact > input { min-width:0; }
  .lead-form-row-compact { display:flex; flex-direction:column; gap:10px; }
  .lead-error { color:#f87171; font-size:13px; padding:10px 14px; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3); }
  .lead-success { text-align:center; padding:24px 0; }
  .lead-success-title { font-family:var(--display); font-size:22px; letter-spacing:1px; color:var(--text); margin-bottom:8px; }
  .lead-success-text { font-size:14px; color:var(--muted); margin-bottom:20px; }

  .lead-modal-backdrop {
    position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:1000;
    display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .lead-modal {
    background:var(--dark2); border:1px solid rgba(212,168,87,0.25); max-width:420px; width:100%;
    padding:36px 32px; position:relative;
  }
  .lead-modal-close {
    position:absolute; top:14px; right:14px; background:none; border:none; color:var(--muted);
    font-size:16px; cursor:pointer; padding:6px;
  }
  .lead-modal-close:hover { color:var(--text); }
  .lead-modal-eyebrow { font-size:10px; letter-spacing:3px; color:var(--orange); text-transform:uppercase; margin-bottom:10px; }
  .lead-modal-title { font-family:var(--display); font-size:24px; letter-spacing:1px; color:var(--text); margin-bottom:12px; line-height:1.1; }
  .lead-modal-text { font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:24px; }

  @media (max-width: 480px) {
    .lead-modal { padding:28px 22px; }
  }
`

const ICON = {
  over:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  diensten:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11M5 5l2 2M19 19l-2-2M3 14l3-3M18 9l3-3M14 3l-3 3M9 18l-3 3M9.5 9.5l5 5"/></svg>,
  expertise: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M9 13.5 7 22l5-3 5 3-2-8.5"/></svg>,
  resultaten:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></svg>,
  reviews:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>,
  blog:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  faq:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.83 1c0 2-2.93 2-2.93 4"/><line x1="12" y1="17" x2="12" y2="17"/></svg>,
  pakketten: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.8 0l-7.4-7.4a2 2 0 0 1 0-2.8L10.4 2.4a2 2 0 0 1 2.8 0l7.4 7.4a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>,
  methode:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.2 7.2 10 16M15.8 7.2 14 16"/></svg>,
}

export function SiteNav({ active }) {
  const links = [
    { href: '/#werkwijze', label: 'Methode', icon: ICON.methode },
    { href: '/#diensten', label: 'Voor wie', icon: ICON.diensten },
    { href: '/resultaten', label: 'Resultaten', icon: ICON.resultaten },
    { href: '/#over', label: 'Over Guido', icon: ICON.over },
    { href: '/pakketten', label: 'Pakketten', icon: ICON.pakketten },
    { href: '/blog', label: 'Kennis', icon: ICON.blog },
  ]

  return (
    <nav>
      <a href="/" className="nav-logo">
        <svg width="36" height="34" viewBox="0 0 36 34">
          <polygon points="18,2 13,28 23,28" fill="#D4A857" />
          <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
          <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
          <rect x="0" y="31" width="36" height="2" fill="#D4A857" opacity="0.2" />
        </svg>
        <div>
          <div className="nav-logo-text">GV PERFORMANCE</div>
          <div className="nav-logo-sub">GUIDO VOLS</div>
        </div>
      </a>
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: '1 1 auto', justifyContent: 'flex-end' }}>
        <div className="nav-icons" style={{ minWidth: 0 }}>
          {links.map(l => (
            <a key={l.href} href={l.href} className="nav-icon-item">
              <span className="nav-icon-item-bg" aria-hidden="true" />
              <span className="nav-icon-item-icon">{l.icon}</span>
              <span className="nav-icon-item-label">{l.label}</span>
            </a>
          ))}
        </div>
        <a href="/#contact" className="nav-cta nav-cta-desktop" onClick={() => trackEvent('cta_click', { location: 'nav' })}>Aanvraag</a>
      </div>
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="24" height="22" viewBox="0 0 36 34">
          <polygon points="18,2 13,28 23,28" fill="#D4A857" />
          <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
          <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
        </svg>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, letterSpacing: 3, color: '#888' }}>GV PERFORMANCE</span>
      </div>
      <div className="footer-copy">© 2026 GV Performance — Guido Vols · Den Haag</div>
      <div className="footer-links">
        <a href="https://nl.linkedin.com/in/guido-vols-99b317106" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="/#contact">Contact</a>
        <a href="/privacy">Privacybeleid</a>
        <a href="/login">Inloggen</a>
      </div>
    </footer>
  )
}

export function FloatButton() {
  const ref = React.useRef(null)

  React.useEffect(() => {
    const footer = document.querySelector('footer')
    const btn = ref.current
    if (!footer || !btn) return
    const observer = new IntersectionObserver(
      ([entry]) => btn.classList.toggle('is-hidden', entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <a href="/#contact" className="float-btn" ref={ref} onClick={() => trackEvent('cta_click', { location: 'float-btn' })}>
      <span className="float-btn-pulse" />
      Gratis intake
    </a>
  )
}

export function useFadeIn() {
  if (typeof window === 'undefined') return
}

/**
 * CascadeText — letters slide away on hover/tap and a duplicate set slides in
 * underneath, revealing the same text in a different color. Touch devices
 * simply won't trigger :hover, so it degrades gracefully to static text.
 */
export const CascadeText = React.memo(function CascadeText({
  text,
  as: Component = 'span',
  href,
  target,
  className = '',
  style,
  fontSize,
  staggerDelay = 25,
  duration = 250,
  easing = 'ease-in-out',
  color = 'inherit',
  hoverColor = 'var(--orange, #D4A857)',
  direction = 'up',
  onClick,
}) {
  const [hovered, setHovered] = React.useState(false)

  const chars = React.useMemo(() => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('nl', { granularity: 'grapheme' })
      return Array.from(segmenter.segment(text), (s) => s.segment)
    }
    return [...text]
  }, [text])

  const sign = direction === 'up' ? 1 : -1

  const rootProps = {
    className: `inline-block relative no-underline overflow-hidden cursor-pointer select-none ${className}`.trim(),
    style: {
      ...(fontSize ? { fontSize } : null),
      color: hovered ? hoverColor : color,
      transition: 'color 0.35s ease',
      lineHeight: 1,
      ...style,
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick,
    'aria-label': text,
  }

  if (Component === 'a') {
    rootProps.href = href ?? '#'
    if (target) rootProps.target = target
    if (target === '_blank') rootProps.rel = 'noopener noreferrer'
  }

  return (
    <Component {...rootProps}>
      <span className="inline-flex overflow-hidden relative" style={{ height: '1em' }} aria-hidden="true">
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block relative will-change-transform"
            style={{
              textShadow: `0 ${sign}em currentColor`,
              transition: `transform ${duration}ms ${easing}`,
              transitionDelay: `${i * staggerDelay}ms`,
              transform: hovered ? `translateY(${-sign}em)` : 'translateY(0)',
            }}
          >
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    </Component>
  )
})

/**
 * Officiële Calendly popup-widget — laadt het externe widget-script
 * (assets.calendly.com) lazy en opent op klik een booking-popup. Geen
 * npm-package, geen API-key: puur de publieke embed die Calendly zelf
 * documenteert.
 */
export function CalendlyButton({ children = 'Plan direct je gratis kennismaking', className = 'btn-primary', style, location = 'unknown' }) {
  return (
    <>
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={() => {
          trackEvent('cta_click', { location })
          if (typeof window !== 'undefined' && window.Calendly) {
            window.Calendly.initPopupWidget({ url: CALENDLY_URL })
            trackEvent('booking_open', { location })
          }
        }}
        className={className}
        style={style}
      >
        {children}
      </button>
    </>
  )
}

export const SEGMENT_LABELS = {
  tactical: 'Tactical Athlete',
  topsport: 'Topsport',
  amateur: 'Serieuze Amateur',
}

/**
 * Haalt published rijen op uit een publieke contenttabel (testimonials,
 * case_results), gesorteerd op sort_order. Geeft { rows, loading } terug.
 */
export function usePublishedRows(table) {
  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.from(table).select('*').eq('published', true).order('sort_order', { ascending: true })
      .then(({ data }) => { if (active) { setRows(data || []); setLoading(false) } })
    return () => { active = false }
  }, [table])

  return { rows, loading }
}

export function EmptyState({ Icon = MessageCircle, text }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon size={28} strokeWidth={1.5} /></div>
      <div className="empty-state-text">{text}</div>
    </div>
  )
}

export const LEAD_MAGNET_PDF = '/GV-Performance-Pre-Selectie-Krachttest.pdf'

/**
 * Naam+e-mail formulier voor de gratis-krachttest lead magnet. Post naar
 * /api/leads. Bij succes: directe downloadlink + (indien gegeven) callback.
 */
export function EmailCapture({ source = 'unknown', onSuccess, compact = false }) {
  const [form, setForm] = React.useState({ name: '', email: '' })
  const [status, setStatus] = React.useState('idle')
  const [error, setError] = React.useState('')
  const startedRef = React.useRef(false)

  const trackStart = () => {
    if (startedRef.current) return
    startedRef.current = true
    trackEvent('form_start', { location: source })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading'); setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Er ging iets mis.'); setStatus('error'); return }
      setStatus('success')
      trackEvent('lead_magnet_submit', { location: source })
      onSuccess?.()
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="lead-success">
        <div style={{ display:'flex', justifyContent:'center', color:'var(--orange)', marginBottom: 10 }}><CheckCircle2 size={32} strokeWidth={1.5} /></div>
        <div className="lead-success-title">Check je mail!</div>
        <p className="lead-success-text">We hebben de PDF naar {form.email} gestuurd. Kun je niet wachten?</p>
        <a href={LEAD_MAGNET_PDF} className="btn-primary" download>Download direct</a>
      </div>
    )
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className={compact ? 'lead-form-row-compact' : 'lead-form-row'}>
        <input type="text" placeholder="Jouw naam" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={trackStart} className="form-input" required />
        <input type="email" placeholder="jouw@email.nl" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onFocus={trackStart} className="form-input" required />
      </div>
      {error && <div className="lead-error">{error}</div>}
      <button type="submit" className="btn-primary" disabled={status === 'loading'} style={{ width: '100%', textAlign: 'center' }}>
        {status === 'loading' ? 'VERSTUREN...' : 'GRATIS DOWNLOADEN'}
      </button>
    </form>
  )
}

/**
 * Exit-intent (muis verlaat bovenkant viewport) + scroll-trigger (60%
 * gescrold) popup met de EmailCapture. Verschijnt max. 1x per sessie.
 */
export function ExitIntentModal({ source = 'exit-intent' }) {
  const [show, setShow] = React.useState(false)
  const triggeredRef = React.useRef(false)

  React.useEffect(() => {
    if (sessionStorage.getItem('leadmagnet_shown')) return

    const trigger = () => {
      if (triggeredRef.current) return
      triggeredRef.current = true
      sessionStorage.setItem('leadmagnet_shown', '1')
      setShow(true)
    }

    const onMouseLeave = (e) => { if (e.clientY <= 0) trigger() }
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrolled > 0.6) trigger()
    }

    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (!show) return null

  return (
    <div className="lead-modal-backdrop" onClick={() => setShow(false)}>
      <div className="lead-modal" onClick={e => e.stopPropagation()}>
        <button className="lead-modal-close" onClick={() => setShow(false)} aria-label="Sluiten">✕</button>
        <div className="lead-modal-eyebrow">Gratis download</div>
        <h3 className="lead-modal-title">PRE-SELECTIE KRACHTTEST + NORMEN</h3>
        <p className="lead-modal-text">Test waar je fysiek staat ten opzichte van de selectie-eisen — gratis PDF, direct in je mail.</p>
        <EmailCapture source={source} onSuccess={() => {}} compact />
      </div>
    </div>
  )
}

function CookieConsentBanner({ onChoice }) {
  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        We gebruiken alleen analytische cookies (Google Analytics) om te zien hoe de site gebruikt wordt — en alleen na jouw toestemming.{' '}
        <a href="/privacy">Privacybeleid</a>
      </p>
      <div className="cookie-banner-actions">
        <button className="cookie-banner-decline" onClick={() => onChoice('denied')}>Weigeren</button>
        <button className="cookie-banner-accept" onClick={() => onChoice('granted')}>Accepteren</button>
      </div>
    </div>
  )
}

/**
 * Cookie-consent (AVG) + GA4-loader + automatische scroll-depth tracking.
 * Plaats deze component op elke publieke marketingpagina (niet op
 * dashboard/auth — die worden bewust niet getrackt).
 */
export function Analytics() {
  const [consent, setConsentState] = React.useState(null)
  const firedDepths = React.useRef(new Set())

  React.useEffect(() => {
    setConsentState(getConsent())
  }, [])

  React.useEffect(() => {
    if (consent !== 'granted') return
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = (window.scrollY / total) * 100
      for (const depth of [25, 50, 75, 100]) {
        if (pct >= depth && !firedDepths.current.has(depth)) {
          firedDepths.current.add(depth)
          trackEvent('scroll_depth', { percent: depth, page: window.location.pathname })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [consent])

  const handleChoice = (value) => {
    setConsent(value)
    setConsentState(value)
  }

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
      {consent === null && <CookieConsentBanner onChoice={handleChoice} />}
    </>
  )
}

export function TestimonialCard({ t, compact = false }) {
  const isTruncated = compact && t.quote?.length > 220
  const quote = isTruncated ? t.quote.slice(0, 220).trim() + '…' : t.quote
  return (
    <div className="testi-card">
      <div className="testi-quote">&ldquo;{quote}&rdquo;</div>
      {isTruncated && <a href="/testimonials" className="testi-readmore">Lees het volledige verhaal →</a>}
      <div className="testi-footer">
        {t.avatar_url && (
          <div className="testi-avatar">
            <img src={t.avatar_url} alt={t.name} />
          </div>
        )}
        <div>
          <div className="testi-name">{t.name}</div>
          {t.role && <div className="testi-role">{t.role}</div>}
          {t.result_metric && <div className="testi-metric">{t.result_metric}</div>}
        </div>
      </div>
    </div>
  )
}
