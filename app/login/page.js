'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function Login() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Verkeerde email of wachtwoord. Probeer opnieuw.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputStyle = {
    background: 'var(--dark3)',
    border: '1px solid var(--dark4)',
    color: 'var(--text)',
    ...B,
    fontSize: 15,
    padding: '14px 16px',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 48 }}>
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

      {/* Login card */}
      <div style={{ background: 'var(--dark2)', padding: '48px 40px', width: '100%', maxWidth: 420, border: '1px solid var(--dark4)' }}>
        <h1 style={{ ...D, fontSize: 32, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>INLOGGEN</h1>
        <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Welkom terug. Log in om je dashboard te bekijken.</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>E-mailadres</label>
            <input
              type="email"
              required
              placeholder="jouw@email.nl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Wachtwoord</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginTop: 8 }}
          >
            {loading ? 'INLOGGEN...' : 'INLOGGEN'}
          </button>
        </form>
      </div>

      <p style={{ ...B, fontSize: 12, color: 'var(--muted2)', marginTop: 24, textAlign: 'center' }}>
        Geen account? Neem contact op met je coach.
      </p>
    </div>
  )
}
