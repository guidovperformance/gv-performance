'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const SCALE_LABELS = {
  energy_level: { 1: 'Uitgeput', 2: 'Laag', 3: 'Normaal', 4: 'Goed', 5: 'Top!' },
  mood:         { 1: 'Slecht',   2: 'Matig', 3: 'Oké',    4: 'Goed', 5: 'Super!' },
  sleep_quality:{ 1: 'Slecht',   2: 'Matig', 3: 'Okay',   4: 'Goed', 5: 'Uitstekend' },
  soreness:     { 1: 'Geen',     2: 'Licht', 3: 'Matig',  4: 'Veel', 5: 'Extreem' },
}

function ScaleInput({ label, field, value, onChange, required }) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
        {label}{required && <span style={{ color: 'var(--orange)' }}> *</span>}
      </label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(value === v ? 0 : v)} // toggle: klik nogmaals om te de-selecteren
            style={{
              width: 46, height: 46,
              background: value === v ? 'var(--orange)' : 'var(--dark3)',
              border: `1px solid ${value === v ? 'var(--orange)' : 'rgba(255,255,255,0.08)'}`,
              color: value === v ? '#000' : 'var(--muted)',
              fontFamily: 'var(--font-oswald), sans-serif',
              fontSize: 17, fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {v}
          </button>
        ))}
        {value > 0 && (
          <span style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: 13, color: 'var(--muted)', marginLeft: 4 }}>
            — {SCALE_LABELS[field]?.[value]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function CheckIn() {
  const [clientProfile, setClientProfile] = React.useState(null)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = React.useState(false)
  const [status, setStatus] = React.useState('idle')
  const [form, setForm] = React.useState({
    morning_weight: '',
    morning_pulse: '',
    sleep_quality: 0,
    energy_level: 0,
    mood: 0,
    soreness: 0,
    notes: '',
  })
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
      if (!cp) { router.push('/dashboard'); return }
      setClientProfile(cp)

      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase.from('daily_checkins').select('id').eq('client_id', cp.id).eq('checkin_date', today).single()
      if (existing) setAlreadyCheckedIn(true)
    }
    load()
  }, [])

  const setField = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = async () => {
    // FIXED: valideer dat verplichte velden ingevuld zijn
    if (!form.energy_level || !form.mood) {
      alert('Vul minimaal energie (⚡) en gevoel (😊) in.')
      return
    }
    setStatus('loading')
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('daily_checkins').insert({
      client_id: clientProfile.id,
      checkin_date: today,
      morning_weight: form.morning_weight ? parseFloat(form.morning_weight) : null,
      morning_pulse: form.morning_pulse ? parseInt(form.morning_pulse) : null,
      // FIXED: stuur null als score 0 is (niet geselecteerd)
      sleep_quality: form.sleep_quality > 0 ? form.sleep_quality : null,
      energy_level: form.energy_level > 0 ? form.energy_level : null,
      mood: form.mood > 0 ? form.mood : null,
      soreness: form.soreness > 0 ? form.soreness : null,
      notes: form.notes.trim() || null,
    })
    if (error) { setStatus('error'); return }
    setStatus('success')
    setTimeout(() => router.push('/dashboard/client'), 2000)
  }

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
  }

  const todayLabel = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  if (!clientProfile) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 20, color: 'var(--orange)' }}>LADEN...</div>
  )

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 16, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/client" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Dashboard</a>
      </header>

      <main style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 6 }}>{todayLabel}</div>
        <h1 style={{ ...D, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: 1, marginBottom: 28 }}>DAGELIJKSE CHECK-IN</h1>

        {alreadyCheckedIn ? (
          <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ ...D, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>AL INGECHECKT</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Je hebt vandaag al ingecheckt. Kom morgen terug!</div>
            <a href="/dashboard/client"
              style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', textDecoration: 'none' }}>
              Naar dashboard
            </a>
          </div>
        ) : status === 'success' ? (
          <div style={{ background: 'var(--dark2)', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ ...D, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>CHECK-IN OPGESLAGEN!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Goed gedaan. Terug naar dashboard...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Metingen */}
            <div style={{ background: 'var(--dark2)', padding: '20px 24px' }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16 }}>Ochtendmetingen</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Gewicht (kg)</label>
                  <input type="number" step="0.1" placeholder="75.5" value={form.morning_weight} onChange={e => setField('morning_weight', e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Polsslag (bpm)</label>
                  <input type="number" placeholder="55" value={form.morning_pulse} onChange={e => setField('morning_pulse', e.target.value)} style={inp} />
                </div>
              </div>
            </div>

            {/* Scores */}
            <div style={{ background: 'var(--dark2)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 4 }}>Hoe voel je je vandaag?</div>
              <ScaleInput label="Energieniveau" field="energy_level" value={form.energy_level} onChange={v => setField('energy_level', v)} required />
              <ScaleInput label="Gevoel / stemming" field="mood" value={form.mood} onChange={v => setField('mood', v)} required />
              <ScaleInput label="Slaapkwaliteit" field="sleep_quality" value={form.sleep_quality} onChange={v => setField('sleep_quality', v)} />
              <ScaleInput label="Spierpijn / vermoeidheid" field="soreness" value={form.soreness} onChange={v => setField('soreness', v)} />
            </div>

            {/* Notities */}
            <div style={{ background: 'var(--dark2)', padding: '20px 24px' }}>
              <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Notities / bijzonderheden</label>
              <textarea
                placeholder="Hoe gaat het? Gisteren goed geslapen? Bijzonderheden?"
                rows={4}
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                style={{ ...inp, resize: 'vertical' }}
              />
            </div>

            {status === 'error' && (
              <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                Er ging iets mis. Probeer opnieuw.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
              {status === 'loading' ? 'OPSLAAN...' : '✓ CHECK-IN OPSLAAN'}
            </button>

            <div style={{ ...B, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
              * Energie en gevoel zijn verplicht
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
