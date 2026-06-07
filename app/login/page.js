'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

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
}

export default function Login() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [mode, setMode] = React.useState('login') // 'login' | 'reset'
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/set-password`,
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
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 40 }}>
        <svg width="32" height="30" viewBox="0 0 36 34">
          <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
          <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
          <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
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
            <h1 style={{ ...D, fontSize: 32, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>INLOGGEN</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Welkom terug bij GV Performance.</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>E-mailadres</label>
                <input type="email" required placeholder="jouw@email.nl" value={email} onChange={e => setEmail(e.target.value)} style={inp} autoComplete="email" />
              </div>
              <div>
                <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Wachtwoord</label>
                <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inp} autoComplete="current-password" />
              </div>

              {error && (
                <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '10px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ background: loading ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginTop: 4 }}>
                {loading ? 'INLOGGEN...' : 'INLOGGEN'}
              </button>

              {/* NIEUW: wachtwoord vergeten */}
              <button type="button" onClick={() => { setMode('reset'); setError('') }}
                style={{ ...B, fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'underline', textDecorationColor: 'var(--muted2)' }}>
                Wachtwoord vergeten?
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ ...D, fontSize: 28, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>WACHTWOORD RESET</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen.
            </p>

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>E-mailadres</label>
                <input type="email" required placeholder="jouw@email.nl" value={email} onChange={e => setEmail(e.target.value)} style={inp} autoComplete="email" />
              </div>

              {error && (
                <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '10px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ background: loading ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
                {loading ? 'VERSTUREN...' : 'RESET LINK STUREN'}
              </button>

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
  )
}
