'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const inp = { background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 15, padding: '12px 14px', outline: 'none', width: '100%' }
const lbl = { fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }

function Field({ label, name, form, setForm, type = 'number', placeholder = '' }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} step="any" placeholder={placeholder} value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} style={inp} />
    </div>
  )
}

export default function NewTestResult({ params }) {
  const [clientId, setClientId] = React.useState(null)
  const [status, setStatus] = React.useState('idle')
  const [form, setForm] = React.useState({
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'intake',
    weight_kg: '', height_cm: '', body_fat_pct: '',
    vo2max: '', resting_hr: '',
    squat_1rm: '', deadlift_1rm: '', bench_1rm: '', overhead_1rm: '',
    sprint_10m: '', sprint_30m: '',
    notes: '',
  })
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => { params.then(p => setClientId(p.id)) }, [params])

  const handleSubmit = async () => {
    setStatus('loading')
    const { error } = await supabase.from('test_results').insert({
      client_id: clientId,
      test_date: form.test_date,
      test_type: form.test_type,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      vo2max: form.vo2max ? parseFloat(form.vo2max) : null,
      resting_hr: form.resting_hr ? parseInt(form.resting_hr) : null,
      squat_1rm: form.squat_1rm ? parseFloat(form.squat_1rm) : null,
      deadlift_1rm: form.deadlift_1rm ? parseFloat(form.deadlift_1rm) : null,
      bench_1rm: form.bench_1rm ? parseFloat(form.bench_1rm) : null,
      overhead_1rm: form.overhead_1rm ? parseFloat(form.overhead_1rm) : null,
      sprint_10m: form.sprint_10m ? parseFloat(form.sprint_10m) : null,
      sprint_30m: form.sprint_30m ? parseFloat(form.sprint_30m) : null,
      notes: form.notes || null,
    })
    if (error) { setStatus('error'); return }
    setStatus('success')
    setTimeout(() => router.push(`/dashboard/coach/clients/${clientId}`), 2000)
  }

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
        <a href={`/dashboard/coach/clients/${clientId}`} style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Terug</a>
      </header>

      <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 8 }}>Coach invoer</div>
        <h1 style={{ ...D, fontSize: 40, fontWeight: 700, letterSpacing: 1, marginBottom: 32 }}>TESTRESULTATEN INVOEREN</h1>

        {status === 'success' ? (
          <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ ...D, fontSize: 24, fontWeight: 700 }}>OPGESLAGEN!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Datum + type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>Testdatum</label>
                <input type="date" value={form.test_date} onChange={e => setForm(p => ({...p, test_date: e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Type meting</label>
                <select value={form.test_type} onChange={e => setForm(p => ({...p, test_type: e.target.value}))} style={inp}>
                  <option value="intake">Intake meting</option>
                  <option value="progress">Voortgangsmeting</option>
                  <option value="final">Eindmeting</option>
                </select>
              </div>
            </div>

            {/* Lichaamsmetingen */}
            <div>
              <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 16, color: 'var(--orange)' }}>LICHAAMSMETINGEN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Field label="Gewicht (kg)" name="weight_kg" form={form} setForm={setForm} placeholder="75.5" />
                <Field label="Lengte (cm)" name="height_cm" form={form} setForm={setForm} placeholder="180" />
                <Field label="Vetpercentage (%)" name="body_fat_pct" form={form} setForm={setForm} placeholder="15.0" />
              </div>
            </div>

            {/* Cardiorespiratoir */}
            <div>
              <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 16, color: 'var(--orange)' }}>CARDIORESPIRATOIR</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="VO2max (ml/kg/min)" name="vo2max" form={form} setForm={setForm} placeholder="45.0" />
                <Field label="Rusthartslag (bpm)" name="resting_hr" form={form} setForm={setForm} placeholder="55" />
              </div>
            </div>

            {/* Krachttests */}
            <div>
              <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 16, color: 'var(--orange)' }}>KRACHTTESTS (1RM)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <Field label="Squat (kg)" name="squat_1rm" form={form} setForm={setForm} placeholder="100" />
                <Field label="Deadlift (kg)" name="deadlift_1rm" form={form} setForm={setForm} placeholder="120" />
                <Field label="Bench (kg)" name="bench_1rm" form={form} setForm={setForm} placeholder="80" />
                <Field label="Overhead (kg)" name="overhead_1rm" form={form} setForm={setForm} placeholder="60" />
              </div>
            </div>

            {/* Snelheidstests */}
            <div>
              <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 16, color: 'var(--orange)' }}>SNELHEIDSTESTS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="10m sprint (sec)" name="sprint_10m" form={form} setForm={setForm} placeholder="1.85" />
                <Field label="30m sprint (sec)" name="sprint_30m" form={form} setForm={setForm} placeholder="4.20" />
              </div>
            </div>

            {/* Notities */}
            <div>
              <label style={lbl}>Notities</label>
              <textarea placeholder="Omstandigheden, bijzonderheden, context..." rows={4} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} style={{ ...inp, resize: 'vertical' }} />
            </div>

            {status === 'error' && (
              <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
                Er ging iets mis. Probeer opnieuw.
              </div>
            )}

            <button onClick={handleSubmit} disabled={status === 'loading'} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: 16, border: 'none', cursor: 'pointer', alignSelf: 'flex-start', paddingLeft: 48, paddingRight: 48 }}>
              {status === 'loading' ? 'OPSLAAN...' : 'RESULTATEN OPSLAAN'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
