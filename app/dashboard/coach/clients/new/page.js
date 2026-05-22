'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const inputStyle = {
  background: 'var(--dark3)',
  border: '1px solid var(--dark4)',
  color: 'var(--text)',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 15,
  padding: '14px 16px',
  outline: 'none',
  width: '100%',
}

const labelStyle = {
  ...B, fontSize: 10, letterSpacing: 2,
  color: 'var(--muted)', textTransform: 'uppercase',
  marginBottom: 6, display: 'block'
}

export default function NewClient() {
  const router = useRouter()
  const [status, setStatus] = React.useState('idle')
  const [error, setError] = React.useState('')
  const [form, setForm] = React.useState({
    naam: '', email: '', sport: '', doel: '',
    geboortedatum: '', notities: ''
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')

    const res = await fetch('/api/dashboard/create-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (data.success) {
      setStatus('success')
      setTimeout(() => router.push('/dashboard/coach'), 2000)
    } else {
      setError(data.error || 'Er ging iets mis.')
      setStatus('idle')
    }
  }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>

      {/* Header */}
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/coach" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Terug</a>
      </header>

      <main style={{ padding: '48px 40px', maxWidth: 700, margin: '0 auto' }}>

        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'block', width: 24, height: 2, background: 'var(--orange)' }} />
          Nieuwe klant
        </div>
        <h1 style={{ ...D, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>KLANT TOEVOEGEN</h1>
        <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6 }}>
          De klant ontvangt een uitnodiging per email om een wachtwoord in te stellen en in te loggen op het dashboard.
        </p>

        {status === 'success' ? (
          <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center', border: '1px solid rgba(255,77,0,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ ...D, fontSize: 26, fontWeight: 700, marginBottom: 8 }}>KLANT AANGEMAAKT!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>{form.naam} heeft een uitnodiging ontvangen op {form.email}.<br />Je wordt teruggestuurd naar het dashboard...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Naam + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Volledige naam *</label>
                <input required type="text" placeholder="Jan Jansen" value={form.naam} onChange={set('naam')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>E-mailadres *</label>
                <input required type="email" placeholder="jan@email.nl" value={form.email} onChange={set('email')} style={inputStyle} />
              </div>
            </div>

            {/* Sport + Geboortedatum */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Sport / Discipline</label>
                <input type="text" placeholder="IJshockey, Hyrox, Defensie..." value={form.sport} onChange={set('sport')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Geboortedatum</label>
                <input type="text" placeholder="01-01-1995" value={form.geboortedatum} onChange={set('geboortedatum')} style={inputStyle} />
              </div>
            </div>

            {/* Doel */}
            <div>
              <label style={labelStyle}>Trainingsdoel</label>
              <input type="text" placeholder="Selectie Korps Mariniers, Hyrox sub 1u30, Pre-season opbouw..." value={form.doel} onChange={set('doel')} style={inputStyle} />
            </div>

            {/* Notities */}
            <div>
              <label style={labelStyle}>Notities (intern)</label>
              <textarea
                placeholder="Extra informatie over de klant — blessures, ervaring, beschikbaarheid..."
                rows={4}
                value={form.notities}
                onChange={set('notities')}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {error && (
              <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px 40px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
              >
                {status === 'loading' ? 'AANMAKEN...' : 'KLANT AANMAKEN + UITNODIGING STUREN'}
              </button>
              <a href="/dashboard/coach" style={{ ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Annuleren
              </a>
            </div>

          </form>
        )}
      </main>
    </div>
  )
}
