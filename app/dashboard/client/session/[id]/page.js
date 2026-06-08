'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/app/dashboard/client/page'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function SessionPage({ params }) {
  const [session, setSession] = React.useState(null)
  const [logs, setLogs] = React.useState({})
  const [rpe, setRpe] = React.useState(7)
  const [notes, setNotes] = React.useState('')
  const [status, setStatus] = React.useState('idle')
  const [clientId, setClientId] = React.useState(null)
  const [completedSets, setCompletedSets] = React.useState({})
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => { params.then(p => loadSession(p.id)) }, [params])

  const loadSession = async (sid) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
    if (cp) setClientId(cp.id)
    const { data } = await supabase.from('training_sessions').select('*, session_exercises(*, exercises(*))').eq('id', sid).single()
    if (!data) { router.push('/dashboard/client/week'); return }
    setSession(data)
    const init = {}
    data.session_exercises?.forEach(ex => {
      init[ex.id] = Array.from({ length: ex.sets || 3 }, () => ({ reps: '', weight: ex.weight_kg ? String(ex.weight_kg) : '' }))
    })
    setLogs(init)
  }

  const updateLog = (exId, setIdx, field, val) => {
    setLogs(prev => ({ ...prev, [exId]: prev[exId].map((s, i) => i === setIdx ? { ...s, [field]: val } : s) }))
  }

  const toggleSetDone = (exId, setIdx) => {
    setCompletedSets(prev => {
      const key = `${exId}-${setIdx}`
      return { ...prev, [key]: !prev[key] }
    })
  }

  const handleSave = async () => {
    if (!clientId || !session) return
    setStatus('loading')
    try {
      const { data: sessionLog, error } = await supabase.from('session_logs').insert({ client_id: clientId, session_id: session.id, completed_at: new Date().toISOString(), rpe, notes: notes || null }).select().single()
      if (error) throw error
      for (const ex of session.session_exercises || []) {
        for (let i = 0; i < (logs[ex.id] || []).length; i++) {
          const set = logs[ex.id][i]
          if (!set.reps && !set.weight) continue
          await supabase.from('exercise_logs').insert({ session_log_id: sessionLog.id, session_exercise_id: ex.id, set_number: i+1, reps_performed: set.reps ? parseInt(set.reps) : null, weight_kg: set.weight ? parseFloat(set.weight) : null })
        }
      }
      setStatus('success')
      setTimeout(() => router.push('/dashboard/client'), 2000)
    } catch (e) {
      setStatus('error')
    }
  }

  const RPE_LABELS = { 1:'Heel licht', 2:'Licht', 3:'Matig', 4:'Tamelijk zwaar', 5:'Zwaar', 6:'Zwaar+', 7:'Erg zwaar', 8:'Zeer zwaar', 9:'Bijna max', 10:'Maximaal' }
  const rpeColor = rpe <= 4 ? '#4ade80' : rpe <= 6 ? '#fb923c' : rpe <= 8 ? '#ff9a3c' : '#f87171'

  if (!session) return <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-oswald)', fontSize: 20, color: 'var(--orange)', letterSpacing: 3 }}>LADEN...</div>

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', paddingBottom: 24 }}>
      <TopBar backHref="/dashboard/client/week" backLabel="Week" />
      <main style={{ padding: 'var(--page-px)', paddingTop: 16 }}>

        {status === 'success' ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: 48, textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
            <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>TOP GEDAAN!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Training voltooid. Terug naar dashboard...</div>
          </div>
        ) : (<>
          {/* Header */}
          <span className="badge badge-orange" style={{ marginBottom: 8 }}>{session.session_type}</span>
          <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{session.session_name}</div>
          <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{session.session_exercises?.length || 0} oefeningen · Sets invullen per oefening</div>

          {/* Oefeningen */}
          {session.session_exercises?.map((ex, i) => {
            const allDone = (logs[ex.id] || []).every((_, j) => completedSets[`${ex.id}-${j}`])
            return (
              <div key={ex.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: `1px solid ${allDone ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`, padding: '18px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ ...D, fontSize: 14, fontWeight: 700, color: 'var(--orange)' }}>{i+1}</span>
                      <span style={{ ...D, fontSize: 18, fontWeight: 700 }}>{ex.exercises?.name}</span>
                      {allDone && <span style={{ fontSize: 16 }}>✅</span>}
                    </div>
                    <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {ex.sets} sets × {ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}{ex.rest_seconds ? ` · Rust ${ex.rest_seconds}s` : ''}
                    </div>
                  </div>
                </div>

                {/* Set headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: 6, marginBottom: 6 }}>
                  {['SET','REPS','KG',''].map(h => <div key={h} style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textAlign: 'center' }}>{h}</div>)}
                </div>

                {(logs[ex.id] || []).map((set, j) => {
                  const done = completedSets[`${ex.id}-${j}`]
                  return (
                    <div key={j} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: 6, marginBottom: 6, opacity: done ? 0.6 : 1 }}>
                      <div style={{ ...D, fontSize: 14, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j+1}</div>
                      <input type="number" placeholder={ex.reps || '—'} value={set.reps} onChange={e => updateLog(ex.id, j, 'reps', e.target.value)} disabled={done}
                        style={{ background: done ? 'var(--dark4)' : 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, padding: '10px 8px', outline: 'none', textAlign: 'center', colorScheme: 'dark' }} />
                      <input type="number" step="0.5" placeholder={ex.weight_kg ? String(ex.weight_kg) : '—'} value={set.weight} onChange={e => updateLog(ex.id, j, 'weight', e.target.value)} disabled={done}
                        style={{ background: done ? 'var(--dark4)' : 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, padding: '10px 8px', outline: 'none', textAlign: 'center', colorScheme: 'dark' }} />
                      <button onClick={() => toggleSetDone(ex.id, j)} style={{ background: done ? 'rgba(74,222,128,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#4ade80' : 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                        {done ? '✓' : '○'}
                      </button>
                    </div>
                  )
                })}
                {ex.notes && <div style={{ ...B, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 8, padding: '8px 12px', background: 'var(--dark2)', borderRadius: 8 }}>📝 {ex.notes}</div>}
              </div>
            )
          })}

          {/* RPE */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px', marginTop: 4, marginBottom: 10 }}>
            <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Hoe zwaar was de training?</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ ...D, fontSize: 32, fontWeight: 700, color: rpeColor }}>{rpe}</span>
              <span style={{ ...B, fontSize: 13, color: rpeColor }}>{RPE_LABELS[rpe]}</span>
            </div>
            <input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(parseInt(e.target.value))} style={{ width: '100%', accentColor: rpeColor }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 9, color: 'var(--muted2)', marginTop: 4 }}>
              <span>1 — Licht</span><span>10 — Max</span>
            </div>
          </div>

          {/* Notities */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px', marginBottom: 16 }}>
            <label style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Notities</label>
            <textarea placeholder="Hoe voelde de training? Bijzonderheden?" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '12px', outline: 'none', width: '100%', resize: 'vertical', colorScheme: 'dark' }} />
          </div>

          {status === 'error' && <div style={{ ...B, fontSize: 13, color: '#f87171', padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 12 }}>Er ging iets mis. Probeer opnieuw.</div>}

          <button onClick={handleSave} disabled={status === 'loading'}
            style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', borderRadius: 'var(--r-btn)', color: '#000', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', width: '100%' }}>
            {status === 'loading' ? 'OPSLAAN...' : '✓ TRAINING VOLTOOIEN'}
          </button>
        </>)}
      </main>
    </div>
  )
}
