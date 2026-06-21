'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const CSS = `
  .login-split { display: flex; min-height: 100vh; }
  .login-panel {
    flex: 1; display: none; position: relative; overflow: hidden;
    background: radial-gradient(circle at 50% 50%, rgba(212,168,87,0.06) 0%, transparent 60%), #0A0A0A;
    border-right: 1px solid rgba(212,168,87,0.1);
  }
  @media (min-width: 1024px) { .login-panel { display: flex; align-items: center; justify-content: center; } }

  .orbit-stage { position: relative; width: 480px; height: 480px; display: flex; align-items: center; justify-content: center; }
  .orbit-center { position: relative; z-index: 5; text-align: center; }

  .ripple-ring {
    position: absolute; top: 50%; left: 50%; border-radius: 50%;
    border: 1px solid rgba(212,168,87,0.15);
    transform: translate(-50%, -50%);
    animation: ripple 3s ease-in-out infinite;
  }

  .orbit-ring { position: absolute; top: 50%; left: 50%; border-radius: 50%; border: 1px dashed rgba(255,255,255,0.07); transform: translate(-50%,-50%); }
  .orbit-track { position: absolute; inset: 0; animation: orbit linear infinite; }
  .orbit-track.reverse { animation-direction: reverse; }
  .orbit-badge {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--dark2, #111); border: 1px solid rgba(212,168,87,0.3); border-radius: 999px;
    padding: 7px 14px; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; color: #D4A857; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }

  @keyframes ripple {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .orbit-track, .ripple-ring { animation: none; }
  }

  /* box-reveal entrance */
  .box-reveal { position: relative; display: block; overflow: hidden; }
  .box-reveal-bar {
    position: absolute; inset: 0; background: var(--orange, #D4A857);
    transform: translateX(0); transition: transform 0.4s ease;
  }
  .box-reveal.in .box-reveal-bar { transform: translateX(101%); }
  .box-reveal-content { opacity: 0; transform: translateY(16px); transition: opacity 0.45s ease, transform 0.45s ease; }
  .box-reveal.in .box-reveal-content { opacity: 1; transform: translateY(0); }

  /* glow input */
  .glow-input-wrap {
    position: relative; border-radius: 10px; padding: 1px;
    background: radial-gradient(140px circle at var(--mx, 50%) var(--my, 50%), rgba(212,168,87,0.7), transparent 75%);
    transition: background 0.15s ease;
  }
  .glow-input-wrap input {
    position: relative; display: block; width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .box-reveal-bar, .box-reveal-content { transition: none; }
  }
`

const inp = {
  background: 'var(--dark3)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--text)',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 15,
  padding: '14px 16px',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark',
  transition: 'border-color 0.2s',
  borderRadius: 9,
}

function Reveal({ as: Tag = 'div', delay = 0, style, className = '', children }) {
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), 80 + delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <Tag className={`box-reveal ${show ? 'in' : ''} ${className}`} style={style}>
      <span className="box-reveal-bar" aria-hidden="true" />
      <span className="box-reveal-content" style={{ display: 'block' }}>{children}</span>
    </Tag>
  )
}

function GlowInput(props) {
  const wrapRef = React.useRef(null)
  const handleMove = (e) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  return (
    <div ref={wrapRef} className="glow-input-wrap" onMouseMove={handleMove}>
      <input {...props} style={inp} />
    </div>
  )
}

const QUALIFICATIES = ['KSS 3 BOKSEN', 'KNAU LOOPTRAINER', 'ASM', 'HYROX', 'TACTICAL', 'EHBO']

function OrbitPanel() {
  return (
    <div className="orbit-stage">
      {[120, 180, 240].map(size => (
        <div key={size} className="ripple-ring" style={{ width: size, height: size }} />
      ))}
      {[150, 230].map((radius, i) => (
        <div key={radius} className="orbit-ring" style={{ width: radius * 2, height: radius * 2 }} />
      ))}

      {QUALIFICATIES.map((q, i) => {
        const radius = i % 2 === 0 ? 150 : 230
        const duration = 18 + i * 3
        const delay = -(i * 2)
        return (
          <div
            key={q}
            className={`orbit-track ${i % 2 ? 'reverse' : ''}`}
            style={{ '--r': `${radius}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          >
            <span className="orbit-badge">{q}</span>
          </div>
        )
      })}

      <div className="orbit-center">
        <svg width="56" height="52" viewBox="0 0 36 34" style={{ margin: '0 auto 16px' }}>
          <polygon points="18,2 13,28 23,28" fill="#D4A857" />
          <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
          <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
        </svg>
        <div style={{ ...D, fontSize: 22, letterSpacing: 4, color: 'var(--text)', fontWeight: 700 }}>GV PERFORMANCE</div>
        <div style={{ ...B, fontSize: 11, letterSpacing: 3, color: '#D4A857', marginTop: 6 }}>GUIDO VOLS</div>
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [mode, setMode] = React.useState('login')
  const [resetSent, setResetSent] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Verkeerd e-mailadres of wachtwoord.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) { setError('Vul je e-mailadres in.'); return }
    setLoading(true)
    setError('')

    // /auth/confirm verwerkt tokens via #hash — Outlook SafeLinks fetcht geen hashes
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://www.gvperformance.nl/auth/confirm`,
    })
    if (error) {
      setError('Er ging iets mis. Controleer het e-mailadres.')
      setLoading(false)
    } else {
      setResetSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-split" style={{ background: 'var(--dark)' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="login-panel">
        <OrbitPanel />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 40 }}>
          <svg width="32" height="30" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857" />
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
          </svg>
          <div>
            <div style={{ ...D, fontSize: 20, letterSpacing: 3, color: 'var(--text)', lineHeight: 1, fontWeight: 700 }}>GV PERFORMANCE</div>
            <div style={{ ...B, fontSize: 9, letterSpacing: 3, color: 'var(--orange)', marginTop: 2 }}>GUIDO VOLS</div>
          </div>
        </a>

        <div style={{ background: 'var(--dark2)', padding: 'clamp(28px, 5vw, 48px) clamp(24px, 5vw, 40px)', width: '100%', maxWidth: 420, border: '1px solid rgba(255,255,255,0.06)' }}>

          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📨</div>
              <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>E-MAIL VERSTUURD</div>
              <div style={{ ...B, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Check je inbox op <strong style={{ color: 'var(--text)' }}>{email}</strong> en klik op de link om je wachtwoord opnieuw in te stellen.
              </div>
              <button onClick={() => { setMode('login'); setResetSent(false) }}
                style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Terug naar inloggen
              </button>
            </div>
          ) : mode === 'login' ? (
            <>
              <Reveal as="h1" delay={0} style={{ ...D, fontSize: 32, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>INLOGGEN</Reveal>
              <Reveal as="p" delay={60} style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Welkom terug bij GV Performance.</Reveal>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Reveal delay={120}>
                  <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>E-mailadres</label>
                  <GlowInput type="email" required placeholder="jouw@email.nl" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </Reveal>
                <Reveal delay={180}>
                  <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Wachtwoord</label>
                  <GlowInput type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                </Reveal>

                {error && (
                  <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '10px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                    {error}
                  </div>
                )}

                <Reveal delay={240}>
                  <button type="submit" disabled={loading}
                    style={{ background: loading ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginTop: 4, borderRadius: 9 }}>
                    {loading ? 'INLOGGEN...' : 'INLOGGEN'}
                  </button>
                </Reveal>

                <button type="button" onClick={() => { setMode('reset'); setError('') }}
                  style={{ ...B, fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'underline', textDecorationColor: 'var(--muted2)' }}>
                  Wachtwoord vergeten?
                </button>
              </form>
            </>
          ) : (
            <>
              <Reveal as="h1" delay={0} style={{ ...D, fontSize: 28, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>WACHTWOORD RESET</Reveal>
              <Reveal as="p" delay={60} style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
                Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen.
              </Reveal>

              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Reveal delay={120}>
                  <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>E-mailadres</label>
                  <GlowInput type="email" required placeholder="jouw@email.nl" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </Reveal>

                {error && (
                  <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '10px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                    {error}
                  </div>
                )}

                <Reveal delay={180}>
                  <button type="submit" disabled={loading}
                    style={{ background: loading ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', borderRadius: 9 }}>
                    {loading ? 'VERSTUREN...' : 'RESET LINK STUREN'}
                  </button>
                </Reveal>

                <button type="button" onClick={() => { setMode('login'); setError('') }}
                  style={{ ...B, fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                  ← Terug naar inloggen
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ ...B, fontSize: 12, color: 'var(--muted2)', marginTop: 20, textAlign: 'center' }}>
          Geen account? Neem contact op met je coach.
        </p>
      </div>
    </div>
  )
}
