'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function SetPassword() {
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [status, setStatus] = React.useState('idle')
  const [error, setError] = React.useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Wachtwoorden komen niet overeen.'); return }
    if (password.length < 8) { setError('Wachtwoord moet minimaal 8 tekens zijn.'); return }

    setStatus('loading')
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setStatus('idle')
    } else {
      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  const inp = { background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 48 }}>
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

      <div style={{ background: 'var(--dark2)', padding: '48px 40px', width: '100%', maxWidth: 420, border: '1px solid var(--dark4)' }}>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ ...D, fontSize: 24, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>WACHTWOORD INGESTELD!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Je wordt doorgestuurd naar je dashboard...</div>
          </div>
        ) : (
          <>
            <h1 style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>WELKOM!</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
              Stel een wachtwoord in om toegang te krijgen tot jouw persoonlijke dashboard.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Nieuw wachtwoord</label>
                <input type="password" required placeholder="Minimaal 8 tekens" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>Bevestig wachtwoord</label>
                <input type="password" required placeholder="Herhaal wachtwoord" value={confirm} onChange={e => setConfirm(e.target.value)} style={inp} />
              </div>

              {error && (
                <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={status === 'loading'} style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: 16, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', width: '100%', marginTop: 8 }}>
                {status === 'loading' ? 'OPSLAAN...' : 'WACHTWOORD INSTELLEN'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
