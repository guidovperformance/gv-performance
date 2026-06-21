'use client'
import React from 'react'

export const SITE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Barlow+Condensed:wght@400;500;700&display=swap');

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
    --display: 'Oswald', Impact, sans-serif;
    --body:    'Barlow Condensed', sans-serif;
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
  }

  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 60px; border-bottom: 1px solid rgba(212,168,87,0.12);
    background: rgba(10,10,10,0.97); position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(8px);
  }
  .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; }
  .nav-logo-text { font-family:var(--display); font-size:22px; letter-spacing:3px; color:var(--text); line-height:1; }
  .nav-logo-sub  { font-family:var(--body); font-size:10px; letter-spacing:3px; color:var(--orange); margin-top:2px; }
  .nav-links { display:flex; gap:32px; list-style:none; align-items:center; }
  .nav-links a {
    font-family:var(--body); font-size:13px; letter-spacing:2px;
    text-transform:uppercase; color:var(--muted); text-decoration:none;
    transition: color .2s; position: relative;
  }
  .nav-links a::after {
    content:''; position:absolute; bottom:-3px; left:0;
    width:0; height:2px; background:var(--orange); transition:width .25s;
  }
  .nav-links a:hover { color:var(--text); }
  .nav-links a:hover::after { width:100%; }
  .nav-links a.active { color: var(--orange); }
  .nav-cta {
    background:var(--orange); color:#000 !important;
    padding:10px 22px; font-weight:700; letter-spacing:1px !important;
  }
  .nav-cta::after { display:none !important; }

  /* NAV DROPDOWN */
  .nav-dropdown { position: relative; }
  .nav-dropdown-trigger {
    display: flex; align-items: center; gap: 5px; cursor: pointer;
    font-family: var(--body); font-size: 13px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted); transition: color .2s;
    background: none; border: none; padding: 0;
  }
  .nav-dropdown:hover .nav-dropdown-trigger,
  .nav-dropdown:focus-within .nav-dropdown-trigger { color: var(--text); }
  .nav-dropdown-caret { font-size: 9px; transition: transform .2s; display: inline-block; }
  .nav-dropdown:hover .nav-dropdown-caret,
  .nav-dropdown:focus-within .nav-dropdown-caret { transform: rotate(180deg); }
  .nav-dropdown-menu {
    position: absolute; top: 100%; left: 50%;
    transform: translateX(-50%) translateY(-6px);
    background: var(--dark2); border: 1px solid rgba(212,168,87,0.15);
    border-radius: 10px; min-width: 170px; padding: 6px; margin-top: 10px;
    list-style: none; opacity: 0; pointer-events: none;
    transition: opacity .2s ease, transform .2s ease;
    box-shadow: 0 12px 32px rgba(0,0,0,0.45); z-index: 110;
  }
  .nav-dropdown:hover .nav-dropdown-menu,
  .nav-dropdown:focus-within .nav-dropdown-menu {
    opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0);
  }
  .nav-dropdown-menu li a {
    display: block; padding: 10px 14px; font-size: 12px; letter-spacing: 1px;
    color: var(--muted); text-decoration: none; border-radius: 6px; white-space: nowrap;
  }
  .nav-dropdown-menu li a::after { display: none !important; }
  .nav-dropdown-menu li a:hover { background: rgba(212,168,87,0.08); color: var(--orange); }

  /* MOBILE HAMBURGER + DRAWER */
  .nav-hamburger {
    display: none; flex-direction: column; justify-content: center; gap: 5px;
    width: 40px; height: 40px; background: none; border: none; cursor: pointer; padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-hamburger span {
    display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px;
    margin: 0 auto; transition: transform .25s ease, opacity .25s ease;
  }
  .nav-hamburger[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-hamburger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .nav-hamburger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .nav-mobile-drawer {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,10,10,0.98); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    display: flex; flex-direction: column;
    padding: calc(env(safe-area-inset-top, 0px) + 90px) 28px 40px;
    opacity: 0; pointer-events: none; transform: translateY(-12px);
    transition: opacity .25s ease, transform .25s ease;
    overflow-y: auto;
  }
  .nav-mobile-drawer.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
  .nav-mobile-links { display: flex; flex-direction: column; gap: 2px; }
  .nav-mobile-links a {
    font-family: var(--display); font-size: 22px; letter-spacing: 1px; color: var(--text);
    text-decoration: none; padding: 16px 4px; border-bottom: 1px solid rgba(255,255,255,0.07);
    display: block; min-height: 44px;
  }
  .nav-mobile-links a.nav-mobile-sub {
    font-size: 15px; font-family: var(--body); color: var(--muted); text-transform: uppercase;
    letter-spacing: 2px; padding-left: 18px; font-weight: 700;
  }
  .nav-mobile-cta {
    margin-top: 24px; background: var(--orange); color: #000 !important;
    text-align: center; border-radius: 10px; font-family: var(--body) !important;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    border-bottom: none !important; padding: 16px !important; font-size: 14px !important;
  }
  @media (max-width: 768px) {
    .nav-hamburger { display: flex; }
  }

  section { padding:100px 60px; }
  .section-label {
    font-size:10px; letter-spacing:4px; color:var(--orange); text-transform:uppercase;
    margin-bottom:14px; display:flex; align-items:center; gap:10px;
  }
  .section-label::before { content:''; display:block; width:24px; height:2px; background:var(--orange); }
  .section-title {
    font-family:var(--display); font-size:clamp(42px,5vw,68px);
    letter-spacing:2px; line-height:0.95; margin-bottom:24px;
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
    line-height:0.95; letter-spacing:2px; color:var(--text); margin-bottom:20px;
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
    nav { padding:18px 24px; }
    .nav-links { display:none; }
    section { padding:60px 24px; }
    .page-hero { padding:110px 24px 60px; }
    footer { padding:30px 24px; flex-direction:column; align-items:flex-start; }
    .float-btn { bottom:20px; right:16px; left:16px; justify-content:center; }
  }
`

export function SiteNav({ active }) {
  const [open, setOpen] = React.useState(false)
  const links = [
    { href: '/expertise', label: 'Expertise' },
    { href: '/resultaten', label: 'Resultaten' },
    { href: '/testimonials', label: 'Reviews' },
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/pakketten', label: 'Pakketten' },
  ]

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
      <ul className="nav-links">
        <li className="nav-dropdown" tabIndex={0}>
          <span className="nav-dropdown-trigger">Over Guido <span className="nav-dropdown-caret">▾</span></span>
          <ul className="nav-dropdown-menu">
            <li><a href="/#over">Over Guido</a></li>
            <li><a href="/#diensten">Diensten</a></li>
          </ul>
        </li>
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} className={active === l.label ? 'active' : ''}>{l.label}</a>
          </li>
        ))}
        <li><a href="/#contact" className="nav-cta">Kennismaking</a></li>
      </ul>

      <button
        className="nav-hamburger"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-mobile-drawer ${open ? 'open' : ''}`}>
        <div className="nav-mobile-links">
          <a href="/#over" onClick={() => setOpen(false)}>Over Guido</a>
          <a href="/#diensten" className="nav-mobile-sub" onClick={() => setOpen(false)}>Diensten</a>
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href="/#contact" className="nav-mobile-cta" onClick={() => setOpen(false)}>Kennismaking</a>
        </div>
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
