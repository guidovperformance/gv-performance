'use client'
import React from 'react'

export const SITE_CSS = `
  :root {
    --orange: #D4A857;
    --orange-dim: rgba(212,168,87,0.15);
    --dark:  #0A0A0A;
    --dark2: #111;
    --dark3: #181818;
    --dark4: #222;
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
    background: #0A0A0A; position: fixed; top: 0; left: 0; right: 0; z-index: 100;
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
}

export function SiteNav({ active }) {
  const links = [
    { href: '/#over', label: 'Over Guido', icon: ICON.over },
    { href: '/#diensten', label: 'Diensten', icon: ICON.diensten },
    { href: '/expertise', label: 'Expertise', icon: ICON.expertise },
    { href: '/resultaten', label: 'Resultaten', icon: ICON.resultaten },
    { href: '/testimonials', label: 'Reviews', icon: ICON.reviews },
    { href: '/blog', label: 'Blog', icon: ICON.blog },
    { href: '/faq', label: 'FAQ', icon: ICON.faq },
    { href: '/pakketten', label: 'Pakketten', icon: ICON.pakketten },
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
        <a href="/#contact" className="nav-cta nav-cta-desktop">Kennismaking</a>
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
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
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
    <a href="/#contact" className="float-btn" ref={ref}>
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
