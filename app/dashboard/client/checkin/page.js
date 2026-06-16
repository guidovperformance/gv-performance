'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BottomNav, TopBar } from '@/app/dashboard/client/components'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const SCORES = {
  energy_level: { label: 'Energieniveau', icons: ['😴','😕','😐','😊','⚡'], colors: ['#555','#fb923c','#ffe066','#4ade80','#38e8e8'] },
  mood:         { label: 'Gevoel / stemming', icons: ['😞','😕','😐','😊','😄'], colors: ['#f87171','#fb923c','#ffe066','#4ade80','#a78bfa'] },
  sleep_quality:{ label: 'Slaapkwaliteit', icons: ['💤😫','💤😕','💤😐','💤😊','💤⭐'], colors: ['#f87171','#fb923c','#ffe066','#4ade80','#60a5fa'] },
  soreness:     { label: 'Spierpijn', icons: ['✅','😐','😬','😣','🔥'], colors: ['#4ade80','#ffe066','#fb923c','#f87171','#a78bfa'] },
}

function ScoreRow({ field, value, onChange }) {
  const { label, icons, colors } = SCORES[field]
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ ...B, fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1,2,3,4,5].map(v => {
          const active = value === v
          return (
            <button key={v} onClick={() => onChange(value === v ? 0 : v)}
              style={{ flex: 1, aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: active ? colors[v-1]+'22' : 'var(--dark3)', border: `2px solid ${active ? colors[v-1] : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', fontSize: 20 }}>
              {icons[v-1]}
            </button>
          )
        })}
      </div>
      {value > 0 && (
        <div style={{ ...B, fontSize: 11, color: colors[value-1], marginTop: 6, textAlign: 'center', letterSpacing: 1 }}>
          {['Slecht','Matig','Oké','Goed','Top!'][value-1]}
        </div>
      )}
    </div>
  )
}

export default function CheckIn() {
  const [cp, setCp] = React.useState(null)
  const [alreadyDone, setAlreadyDone] = React.useState(false)
  const [status, setStatus] = React.useState('idle')
  const [form, setForm] = React.useState({ morning_weight: '', morning_pulse: '', sleep_quality: 0, energy_level: 0, mood: 0, soreness: 0, notes: '' })
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
      if (!data) { router.push('/dashboard'); return }
      setCp(data)
      const today = new Date().toISOString().split('T')[0]
      const { data: ex } = await supabase.from('daily_checkins').select('id').eq('client_id', data.id).eq('checkin_date', today).single()
      if (ex) setAlreadyDone(true)
    }
    load()
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.energy_level || !form.mood) { alert('Vul minimaal energie en gevoel in ⚡'); return }
    setStatus('loading')
    const { error } = await supabase.from('daily_checkins').insert({
      client_id: cp.id,
      checkin_date: new Date().toISOString().split('T')[0],
      morning_weight: form.morning_weight ? parseFloat(form.morning_weight) : null,
      morning_pulse: form.morning_pulse ? parseInt(form.morning_pulse) : null,
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

  const inp = { background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 'var(--r-input)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, padding: '14px 16px', outline: 'none', width: '100%', colorScheme: 'dark', textAlign: 'center' }

  if (!cp) return <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-oswald)', color: 'var(--orange)', fontSize: 20, letterSpacing: 3 }}>LADEN...</div>

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="has-bottom-nav">
      <TopBar title="Check-in" />
      <main style={{ padding: 'var(--page-px)', paddingTop: 16 }}>
        <div style={{ ...B, fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div style={{ ...D, fontSize: 26, fontWeight: 700, letterSpacing: 0.5, marginBottom: 20 }}>Dagelijkse check-in</div>

        {alreadyDone ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ ...D, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Al ingecheckt!</div>
            <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Kom morgen terug voor je volgende check-in.</div>
            <a href="/dashboard/client" style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', padding: '12px 24px', ...B, fontSize: 12, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>Naar dashboard</a>
          </div>
        ) : status === 'success' ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid rgba(74,222,128,0.3)', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <div style={{ ...D, fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#4ade80' }}>Check-in opgeslagen!</div>
            <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>Goed bezig. Terug naar dashboard...</div>
          </div>
        ) : (<>
          {/* Metingen */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px', marginBottom: 12 }}>
            <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>Ochtendmetingen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>Gewicht (kg)</div>
                <input type="number" step="0.1" placeholder="—" value={form.morning_weight} onChange={e => set('morning_weight', e.target.value)} style={inp} />
              </div>
              <div>
                <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>Polsslag (bpm)</div>
                <input type="number" placeholder="—" value={form.morning_pulse} onChange={e => set('morning_pulse', e.target.value)} style={inp} />
              </div>
            </div>
          </div>

          {/* Score rows */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px', marginBottom: 12 }}>
            <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Hoe voel je je? <span style={{ color: 'var(--orange)' }}>*</span></div>
            <ScoreRow field="energy_level" value={form.energy_level} onChange={v => set('energy_level', v)} />
            <ScoreRow field="mood" value={form.mood} onChange={v => set('mood', v)} />
            <ScoreRow field="sleep_quality" value={form.sleep_quality} onChange={v => set('sleep_quality', v)} />
            <ScoreRow field="soreness" value={form.soreness} onChange={v => set('soreness', v)} />
          </div>

          {/* Notities */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px', marginBottom: 12 }}>
            <label style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Notities</label>
            <textarea placeholder="Hoe gaat het? Bijzonderheden, blessures?" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '12px', outline: 'none', width: '100%', resize: 'vertical', colorScheme: 'dark' }} />
          </div>

          {status === 'error' && <div style={{ ...B, fontSize: 13, color: '#f87171', padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 12 }}>Er ging iets mis. Probeer opnieuw.</div>}

          <button onClick={handleSubmit} disabled={status === 'loading'}
            style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', color: '#000', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: 'pointer', width: '100%' }}>
            {status === 'loading' ? 'OPSLAAN...' : '✓ CHECK-IN OPSLAAN'}
          </button>
          <div style={{ ...B, fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>* Energie en gevoel zijn verplicht</div>
        </>)}
      </main>
      <BottomNav active="checkin" />
    </div>
  )
}
