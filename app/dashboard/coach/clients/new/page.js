'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const inp = {
  background: 'var(--dark3)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text)',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 15,
  padding: '14px 16px',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark', // FIXED: datum picker zichtbaar op donkere achtergrond
}

const lbl = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 10, letterSpacing: 2,
  color: 'var(--muted)', textTransform: 'uppercase',
  marginBottom: 6, display: 'block',
}

export default function NewClient() {
  const router = useRouter()
  const [status, setStatus] = React.useState('idle')
  const [error, setError] = React.useState('')
  const [form, setForm] = React.useState({
    naam: '', email: '', sport: '', doel: '',
    geboortedatum: '', notities: '',
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async () => {
    if (!form.naam || !form.email) {
      setError('Naam en email zijn verplicht.')
      return
    }
    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/dashboard/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Er ging iets mis.')
        setStatus('idle')
        return
      }

      setStatus('success')
    } catch (e) {
      setError('Verbindingsfout. Probeer opnieuw.')
      setStatus('idle')
    }
  }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 16, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/coach" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Terug</a>
      </header>

      <main style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 640, margin: '0 auto' }}>

        {status === 'success' ? (
          <div style={{ background: 'var(--dark2)', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>KLANT AANGEMAAKT!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
              Een uitnodigingsmail is verstuurd naar <strong style={{ color: 'var(--text)' }}>{form.email}</strong>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a href="/dashboard/coach"
                style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', textDecoration: 'none' }}>
                Naar dashboard
              </a>
              <button onClick={() => { setStatus('idle'); setForm({ naam: '', email: '', sport: '', doel: '', geboortedatum: '', notities: '' }) }}
                style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', background: 'none', cursor: 'pointer' }}>
                Nog een klant
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 8 }}>Nieuwe klant</div>
              <h1 style={{ ...D, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: 1 }}>KLANT TOEVOEGEN</h1>
              <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
                De klant ontvangt een uitnodigingsmail om een wachtwoord in te stellen.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={lbl}>Volledige naam *</label>
                  <input type="text" placeholder="Jan Jansen" value={form.naam} onChange={set('naam')} style={inp} />
                </div>
                <div>
                  <label style={lbl}>E-mailadres *</label>
                  <input type="email" placeholder="jan@email.com" value={form.email} onChange={set('email')} style={inp} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={lbl}>Sport / discipline</label>
                  <input type="text" placeholder="Fitness, hardlopen, BJJ..." value={form.sport} onChange={set('sport')} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Geboortedatum</label>
                  <input type="date" value={form.geboortedatum} onChange={set('geboortedatum')} style={inp} />
                </div>
              </div>

              <div>
                <label style={lbl}>Trainingsdoel</label>
                <input type="text" placeholder="Afslanken, spieropbouw, conditie..." value={form.doel} onChange={set('doel')} style={inp} />
              </div>

              <div>
                <label style={lbl}>Notities (optioneel)</label>
                <textarea rows={4} placeholder="Blessures, bijzonderheden, aanvullende info..." value={form.notities} onChange={set('notities')} style={{ ...inp, resize: 'vertical' }} />
              </div>

              {error && (
                <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={status === 'loading'}
                style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
                {status === 'loading' ? 'AANMAKEN...' : 'KLANT AANMAKEN + UITNODIGING STUREN'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
