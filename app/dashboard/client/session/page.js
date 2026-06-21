'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function SessionPage({ params }) {
  const [session, setSession] = React.useState(null)
  const [logs, setLogs] = React.useState({})
  const [rpe, setRpe] = React.useState(7)
  const [notes, setNotes] = React.useState('')
  const [status, setStatus] = React.useState('idle')
  const [clientId, setClientId] = React.useState(null)
  const [sessionId, setSessionId] = React.useState(null)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    params.then(p => {
      setSessionId(p.id)
      loadSession(p.id)
    })
  }, [params])

  const loadSession = async (sid) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
    if (cp) setClientId(cp.id)

    const { data } = await supabase
      .from('training_sessions')
      .select('*, session_exercises(*, exercises(*))')
      .eq('id', sid)
      .single()
    setSession(data)

    // Init logs
    if (data?.session_exercises) {
      const init = {}
      data.session_exercises.forEach(ex => {
        init[ex.id] = Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || '', weight: ex.weight_kg || '' }))
      })
      setLogs(init)
    }
  }

  const updateLog = (exId, setIdx, field, val) => {
    setLogs(prev => ({
      ...prev,
      [exId]: prev[exId].map((s, i) => i === setIdx ? { ...s, [field]: val } : s)
    }))
  }

  const handleSave = async () => {
    setStatus('loading')
    const { data: sessionLog } = await supabase.from('session_logs').insert({
      session_id: sessionId, client_id: clientId, rpe, notes: notes || null
    }).select().single()

    if (sessionLog) {
      for (const [exId, sets] of Object.entries(logs)) {
        for (const [i, set] of sets.entries()) {
          await supabase.from('exercise_logs').insert({
            session_log_id: sessionLog.id,
            session_exercise_id: exId,
            set_number: i + 1,
            reps_performed: set.reps ? parseInt(set.reps) : null,
            weight_kg: set.weight ? parseFloat(set.weight) : null,
          })
        }
      }
    }
    setStatus('success')
    setTimeout(() => router.push('/dashboard/client'), 2000)
  }

  const inp = { background: 'var(--dark4)', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 14, padding: '8px', outline: 'none', width: '100%', textAlign: 'center' }

  if (!session) return <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 20, color: 'var(--orange)' }}>LADEN...</div>

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(212,168,87,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
        <a href="/dashboard/client/week" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Week</a>
      </header>

      <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
            <div style={{ ...D, fontSize: 28, fontWeight: 700 }}>TRAINING OPGESLAGEN!</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 6 }}>{session.session_type}</div>
              <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>{session.session_name || 'Training'}</h1>
            </div>

            {session.session_exercises?.map((ex, i) => (
              <div key={ex.id} style={{ background: 'var(--dark2)', padding: '20px 24px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{ex.exercises?.name}</div>
                  <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>{ex.sets}x{ex.reps} {ex.weight_kg ? `@ ${ex.weight_kg}kg` : ''}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, marginBottom: 6 }}>
                  <div style={{ ...B, fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>SET</div>
                  <div style={{ ...B, fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>REPS</div>
                  <div style={{ ...B, fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>KG</div>
                </div>
                {(logs[ex.id] || []).map((set, j) => (
                  <div key={j} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, marginBottom: 6 }}>
                    <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j + 1}</div>
                    <input type="number" placeholder="—" value={set.reps} onChange={e => updateLog(ex.id, j, 'reps', e.target.value)} style={inp} />
                    <input type="number" step="0.5" placeholder="—" value={set.weight} onChange={e => updateLog(ex.id, j, 'weight', e.target.value)} style={inp} />
                  </div>
                ))}
              </div>
            ))}

            {/* RPE + notities */}
            <div style={{ background: 'var(--dark2)', padding: '24px', marginTop: 16 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14 }}>Hoe was de training?</div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Inspanning (RPE): <span style={{ ...D, fontSize: 18, color: 'var(--orange)', fontWeight: 700 }}>{rpe}/10</span></div>
                <input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--orange)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                  <span>Heel makkelijk</span><span>Max inspanning</span>
                </div>
              </div>
              <textarea placeholder="Notities — hoe voelde de training?" rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 14, padding: '12px', outline: 'none', width: '100%', resize: 'vertical' }} />
            </div>

            <button onClick={handleSave} disabled={status === 'loading'} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: 'pointer', width: '100%', marginTop: 16 }}>
              {status === 'loading' ? 'OPSLAAN...' : '✓ TRAINING VOLTOOIEN'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
