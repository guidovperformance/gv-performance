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
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    params.then(p => loadSession(p.id))
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

    if (!data) { router.push('/dashboard/client/week'); return }
    setSession(data)

    // Init lege log per set per oefening
    const init = {}
    data.session_exercises?.forEach(ex => {
      init[ex.id] = Array.from({ length: ex.sets || 3 }, () => ({
        reps: '',
        weight: ex.weight_kg ? String(ex.weight_kg) : '',
      }))
    })
    setLogs(init)
  }

  const updateLog = (exId, setIdx, field, val) => {
    setLogs(prev => ({
      ...prev,
      [exId]: prev[exId].map((s, i) => i === setIdx ? { ...s, [field]: val } : s)
    }))
  }

  const handleSave = async () => {
    if (!clientId || !session) return
    setStatus('loading')
    try {
      // Maak session log aan
      const { data: sessionLog, error: logError } = await supabase
        .from('session_logs')
        .insert({
          client_id: clientId,
          session_id: session.id,
          completed_at: new Date().toISOString(),
          rpe,
          notes: notes || null,
        })
        .select()
        .single()

      if (logError) throw logError

      // Sla exercise logs op
      for (const ex of session.session_exercises || []) {
        for (let i = 0; i < (logs[ex.id] || []).length; i++) {
          const set = logs[ex.id][i]
          if (!set.reps && !set.weight) continue // sla lege sets over
          const { error: exLogError } = await supabase.from('exercise_logs').insert({
            session_log_id: sessionLog.id,
            session_exercise_id: ex.id,
            set_number: i + 1,
            reps_performed: set.reps ? parseInt(set.reps) : null,
            weight_kg: set.weight ? parseFloat(set.weight) : null,
          })
          if (exLogError) console.error('Exercise log error:', exLogError)
        }
      }

      setStatus('success')
      setTimeout(() => router.push('/dashboard/client'), 2500)
    } catch (e) {
      console.error('Save error:', e)
      setStatus('error')
    }
  }

  const inp = {
    background: 'var(--dark4)',
    border: 'none',
    color: 'var(--text)',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: 15,
    fontWeight: 700,
    padding: '10px',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
    colorScheme: 'dark',
  }

  if (!session) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 20, color: 'var(--orange)' }}>
      LADEN...
    </div>
  )

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
        <a href="/dashboard/client/week"
          style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Week
        </a>
      </header>

      <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>💪</div>
            <div style={{ ...D, fontSize: 32, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>TRAINING VOLTOOID!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Goed gedaan. Terug naar dashboard...</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 6 }}>
                {session.session_type}
              </div>
              <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                {session.session_name || 'Training'}
              </h1>
              <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>
                {session.session_exercises?.length || 0} oefeningen · Vul je prestaties in per set
              </div>
            </div>

            {session.session_exercises?.map((ex, i) => (
              <div key={ex.id} style={{ background: 'var(--dark2)', padding: '20px 24px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)' }}>{i + 1}</span>
                      <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{ex.exercises?.name}</div>
                    </div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      Schema: {ex.sets}×{ex.reps} {ex.weight_kg ? `@ ${ex.weight_kg}kg` : ''}
                      {ex.rest_seconds ? ` · Rust ${ex.rest_seconds}s` : ''}
                    </div>
                  </div>
                </div>

                {/* Set headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr', gap: 8, marginBottom: 6 }}>
                  <div style={{ ...B, fontSize: 9, color: 'var(--muted)', textAlign: 'center', letterSpacing: 1 }}>SET</div>
                  <div style={{ ...B, fontSize: 9, color: 'var(--muted)', textAlign: 'center', letterSpacing: 1 }}>REPS</div>
                  <div style={{ ...B, fontSize: 9, color: 'var(--muted)', textAlign: 'center', letterSpacing: 1 }}>KG</div>
                </div>

                {/* Sets */}
                {(logs[ex.id] || []).map((set, j) => (
                  <div key={j} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr', gap: 8, marginBottom: 6 }}>
                    <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j + 1}</div>
                    <input
                      type="number"
                      placeholder={ex.reps || '—'}
                      value={set.reps}
                      onChange={e => updateLog(ex.id, j, 'reps', e.target.value)}
                      style={inp}
                    />
                    <input
                      type="number"
                      step="0.5"
                      placeholder={ex.weight_kg ? String(ex.weight_kg) : '—'}
                      value={set.weight}
                      onChange={e => updateLog(ex.id, j, 'weight', e.target.value)}
                      style={inp}
                    />
                  </div>
                ))}

                {ex.notes && (
                  <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic', padding: '8px 10px', background: 'var(--dark3)' }}>
                    📝 {ex.notes}
                  </div>
                )}
              </div>
            ))}

            {/* RPE + notities */}
            <div style={{ background: 'var(--dark2)', padding: 24, marginTop: 8 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16 }}>
                Hoe was de training?
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
                  Inspanning (RPE): <span style={{ ...D, fontSize: 22, color: 'var(--orange)', fontWeight: 700 }}>{rpe}/10</span>
                  <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>
                    {rpe <= 3 ? 'Heel makkelijk' : rpe <= 5 ? 'Matig' : rpe <= 7 ? 'Zwaar' : rpe <= 9 ? 'Erg zwaar' : 'Maximaal'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={e => setRpe(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--orange)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                  <span>1 — Heel makkelijk</span>
                  <span>10 — Max inspanning</span>
                </div>
              </div>
              <textarea
                placeholder="Notities — hoe voelde de training? Bijzonderheden?"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ background: 'var(--dark3)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 14, padding: '12px', outline: 'none', width: '100%', resize: 'vertical', colorScheme: 'dark' }}
              />
            </div>

            {status === 'error' && (
              <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', marginTop: 12 }}>
                Er ging iets mis bij het opslaan. Probeer opnieuw.
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={status === 'loading'}
              style={{ background: status === 'loading' ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', width: '100%', marginTop: 16 }}>
              {status === 'loading' ? 'OPSLAAN...' : '✓ TRAINING VOLTOOIEN'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
