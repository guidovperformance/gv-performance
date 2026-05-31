'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

function ScaleButton({ value, selected, onClick }) {
  return (
    <button onClick={() => onClick(value)} style={{
      width: 44, height: 44,
      background: selected ? 'var(--orange)' : 'var(--dark3)',
      border: `1px solid ${selected ? 'var(--orange)' : 'var(--dark4)'}`,
      color: selected ? '#000' : 'var(--muted)',
      fontFamily: 'var(--font-oswald), sans-serif',
      fontSize: 16, fontWeight: 700,
      cursor: 'pointer',
    }}>{value}</button>
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

      const { data: cp } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!cp) return
      setClientProfile(cp)

      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('client_id', cp.id)
        .eq('checkin_date', today)
        .single()

      if (existing) setAlreadyCheckedIn(true)
    }
    load()
  }, [])

  const handleSubmit = async () => {
    if (!form.energy_level || !form.mood) {
      alert('Vul minimaal energie en gevoel in.')
      return
    }
    setStatus('loading')
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('daily_checkins').insert({
      client_id: clientProfile.id,
      checkin_date: today,
      morning_weight: form.morning_weight ? parseFloat(form.morning_weight) : null,
      morning_pulse: form.morning_pulse ? parseInt(form.morning_pulse) : null,
      sleep_quality: form.sleep_quality || null,
      energy_level: form.energy_level || null,
      mood: form.mood || null,
      soreness: form.soreness || null,
      notes: form.notes || null,
    })
    if (error) { setStatus('error'); return }
    setStatus('success')
    setTimeout(() => router.push('/dashboard/client'), 2000)
  }

  const inp = { background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }
  const lbl = { fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }

  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/client" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Terug</a>
      </header>

      <main style={{ padding: '40px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 8 }}>{today}</div>
        <h1 style={{ ...D, fontSize: 40, fontWeight: 700, letterSpacing: 1, marginBottom: 32 }}>DAGELIJKSE CHECK-IN</h1>

        {alreadyCheckedIn ? (
          <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ ...D, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AL INGECHECKT VANDAAG</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Je hebt vandaag al een check-in ingevuld.</div>
            <a href="/dashboard/client" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>Terug naar dashboard</a>
          </div>
        ) : status === 'success' ? (
          <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ ...D, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>CHECK-IN OPGESLAGEN!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Je wordt teruggestuurd...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Gewicht + pols */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>Ochtendgewicht (kg)</label>
                <input type="number" step="0.1" placeholder="75.5" value={form.morning_weight} onChange={e => setForm(p => ({...p, morning_weight: e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Ochtendpols (bpm)</label>
                <input type="number" placeholder="55" value={form.morning_pulse} onChange={e => setForm(p => ({...p, morning_pulse: e.target.value}))} style={inp} />
              </div>
            </div>

            {/* Slaap */}
            <div>
              <label style={lbl}>Slaapkwaliteit</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1,2,3,4,5].map(v => <ScaleButton key={v} value={v} selected={form.sleep_quality === v} onClick={v => setForm(p => ({...p, sleep_quality: v}))} />)}
                <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
                  {form.sleep_quality === 1 ? 'Slecht' : form.sleep_quality === 3 ? 'Gemiddeld' : form.sleep_quality === 5 ? 'Uitstekend' : ''}
                </span>
              </div>
            </div>

            {/* Energie */}
            <div>
              <label style={lbl}>Energieniveau *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1,2,3,4,5].map(v => <ScaleButton key={v} value={v} selected={form.energy_level === v} onClick={v => setForm(p => ({...p, energy_level: v}))} />)}
                <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
                  {form.energy_level === 1 ? 'Uitgeput' : form.energy_level === 3 ? 'Normaal' : form.energy_level === 5 ? 'Top!' : ''}
                </span>
              </div>
            </div>

            {/* Gevoel */}
            <div>
              <label style={lbl}>Hoe voel je je? *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1,2,3,4,5].map(v => <ScaleButton key={v} value={v} selected={form.mood === v} onClick={v => setForm(p => ({...p, mood: v}))} />)}
                <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
                  {form.mood === 1 ? 'Slecht' : form.mood === 3 ? 'Oké' : form.mood === 5 ? 'Super!' : ''}
                </span>
              </div>
            </div>

            {/* Spierpijn */}
            <div>
              <label style={lbl}>Spierpijn / vermoeidheid</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1,2,3,4,5].map(v => <ScaleButton key={v} value={v} selected={form.soreness === v} onClick={v => setForm(p => ({...p, soreness: v}))} />)}
                <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
                  {form.soreness === 1 ? 'Geen' : form.soreness === 3 ? 'Matig' : form.soreness === 5 ? 'Veel' : ''}
                </span>
              </div>
            </div>

            {/* Notities */}
            <div>
              <label style={lbl}>Notities / bijzonderheden</label>
              <textarea placeholder="Hoe gaat het? Bijzonderheden van gisteren of vandaag..." rows={4} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} style={{ ...inp, resize: 'vertical' }} />
            </div>

            {status === 'error' && (
              <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                Er ging iets mis. Probeer opnieuw.
              </div>
            )}

            <button onClick={handleSubmit} disabled={status === 'loading'} style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: 16, border: 'none', cursor: 'pointer' }}>
              {status === 'loading' ? 'OPSLAAN...' : 'CHECK-IN OPSLAAN'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
