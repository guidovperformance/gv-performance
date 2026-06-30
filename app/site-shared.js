'use client'
import React from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { GA_MEASUREMENT_ID, trackEvent, hasConsent, setConsent, getConsent } from '@/lib/analytics'
import { MessageCircle, CheckCircle2 } from 'lucide-react'
import { SITE_CSS } from './site-css'

export const CALENDLY_URL = 'https://calendly.com/guidovperformance/30min'
export { SITE_CSS }


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

    // Niet triggeren als het contactformulier al in beeld is — anders blokkeert
    // de popup de "verstuur"-knop precies op het moment dat iemand een aanvraag doet.
    const contactInView = () => {
      const el = document.getElementById('contact')
      if (!el) return false
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }

    const onMouseLeave = (e) => { if (e.clientY <= 0 && !contactInView()) trigger() }
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrolled > 0.6 && !contactInView()) trigger()
    }

    // Extra vangnet: als de popup al getriggerd was vlak vóórdat het
    // contactformulier in beeld kwam (bv. tijdens een snelle scrollbeweging),
    // sluit 'm dan alsnog automatisch zodra het formulier zichtbaar wordt.
    const onScrollCloseIfContactVisible = () => {
      if (triggeredRef.current && contactInView()) setShow(false)
    }

    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScrollCloseIfContactVisible, { passive: true })
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScrollCloseIfContactVisible)
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
