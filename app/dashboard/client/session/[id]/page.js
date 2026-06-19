'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/app/dashboard/client/components'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

function parseNotes(raw) {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return { _raw: raw } }
}

const MODE_CONFIG = {
  kracht:     { color: 'var(--orange)',  bg: 'rgba(255,77,0,0.12)',   label: 'KRACHT' },
  conditie:   { color: '#4ade80',        bg: 'rgba(74,222,128,0.12)', label: 'CONDITIE' },
  mobiliteit: { color: '#60a5fa',        bg: 'rgba(96,165,250,0.12)', label: 'MOBILITEIT' },
}

export default function SessionPage({ params }) {
  const resolvedParams = React.use(params)
  const sessionId = resolvedParams?.id

  const [session, setSession] = React.useState(null)
  const [logs, setLogs] = React.useState({})
  const [completedSets, setCompletedSets] = React.useState({})
  const [activeExercise, setActiveExercise] = React.useState(null)
  const [rpe, setRpe] = React.useState(7)
  const [notes, setNotes] = React.useState('')
  const [status, setStatus] = React.useState('idle')
  const [clientId, setClientId] = React.useState(null)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => { if (sessionId) loadSession(sessionId) }, [sessionId])

  const loadSession = async (sid) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).maybeSingle()
    if (cp) setClientId(cp.id)
    const { data } = await supabase.from('training_sessions').select('*, session_exercises(*)').eq('id', sid).maybeSingle()
    if (!data) { router.push('/dashboard/client/week'); return }
    // Sort by order_index
    if (data.session_exercises) {
      data.session_exercises.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    }
    setSession(data)
    const init = {}
    data.session_exercises?.forEach(ex => {
      init[ex.id] = Array.from({ length: ex.sets || 3 }, () => ({ reps: '', weight: ex.weight_kg ? String(ex.weight_kg) : '' }))
    })
    setLogs(init)
    setActiveExercise(data.session_exercises?.[0]?.id || null)
  }

  const updateLog = (exId, setIdx, field, val) => {
    setLogs(prev => ({ ...prev, [exId]: prev[exId].map((s, i) => i === setIdx ? { ...s, [field]: val } : s) }))
  }

  const toggleSetDone = (exId, setIdx) => {
    setCompletedSets(prev => {
      const key = `${exId}-${setIdx}`
      const next = { ...prev, [key]: !prev[key] }
      // Auto-open next exercise when all sets done
      const ex = session.session_exercises.find(e => e.id === exId)
      const allDone = Array.from({ length: ex.sets || 3 }, (_, j) => next[`${exId}-${j}`]).every(Boolean)
      if (allDone && !prev[key]) {
        const idx = session.session_exercises.findIndex(e => e.id === exId)
        const nextEx = session.session_exercises[idx + 1]
        if (nextEx) setTimeout(() => setActiveExercise(nextEx.id), 400)
      }
      return next
    })
  }

  const handleSave = async () => {
    if (!clientId || !session) return
    setStatus('loading')
    try {
      const { data: sessionLog, error } = await supabase.from('session_logs')
        .insert({ client_id: clientId, session_id: session.id, completed_at: new Date().toISOString(), rpe, notes: notes || null })
        .select().single()
      if (error) throw error
      for (const ex of session.session_exercises || []) {
        for (let i = 0; i < (logs[ex.id] || []).length; i++) {
          const set = logs[ex.id][i]
          if (!set.reps && !set.weight) continue
          await supabase.from('exercise_logs').insert({
            session_log_id: sessionLog.id, session_exercise_id: ex.id,
            set_number: i + 1, reps_performed: set.reps ? parseInt(set.reps) : null,
            weight_kg: set.weight ? parseFloat(set.weight) : null
          })
        }
      }
      setStatus('success')
      setTimeout(() => router.push('/dashboard/client'), 2000)
    } catch { setStatus('error') }
  }

  const totalSets = session?.session_exercises?.reduce((a, ex) => a + (ex.sets || 0), 0) || 0
  const doneSets = Object.values(completedSets).filter(Boolean).length
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  const RPE_LABELS = { 1:'Heel licht',2:'Licht',3:'Matig',4:'Tamelijk zwaar',5:'Zwaar',6:'Zwaar+',7:'Erg zwaar',8:'Zeer zwaar',9:'Bijna max',10:'Maximaal' }
  const rpeColor = rpe <= 4 ? '#4ade80' : rpe <= 6 ? '#fb923c' : rpe <= 8 ? '#ff9a3c' : '#f87171'

  if (!session) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 20, color: 'var(--orange)', letterSpacing: 3 }}>
      LADEN...
    </div>
  )

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', paddingBottom: 32 }}>
      <TopBar backHref="/dashboard/client/week" backLabel="← WEEK" />

      <main style={{ padding: '0 var(--page-px)', paddingTop: 16 }}>

        {status === 'success' ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: 48, textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
            <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>TOP GEDAAN!</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Training voltooid. Terug naar dashboard...</div>
          </div>
        ) : (<>

          {/* Header */}
          <span className="badge badge-orange" style={{ marginBottom: 6 }}>{session.session_type}</span>
          <div style={{ ...D, fontSize: 26, fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>{session.session_name}</div>
          <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            {session.session_exercises?.length} oefeningen · {totalSets} sets totaal
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 1, marginBottom: 6 }}>
              <span>VOORTGANG</span>
              <span>{doneSets}/{totalSets} SETS</span>
            </div>
            <div style={{ height: 4, background: 'var(--dark3)', borderRadius: 2 }}>
              <div style={{ height: 4, background: progress === 100 ? '#4ade80' : 'var(--orange)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Compact exercise overview */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 12 }}>
            {session.session_exercises?.map((ex, i) => {
              const meta = parseNotes(ex.notes)
              const mode = meta._mode || 'kracht'
              const cfg = MODE_CONFIG[mode] || MODE_CONFIG.kracht
              const name = ex.exercise_name || ex.exercises?.name || `Oefening ${i + 1}`
              const isActive = activeExercise === ex.id
              const setsArr = logs[ex.id] || []
              const doneCount = setsArr.filter((_, j) => completedSets[`${ex.id}-${j}`]).length
              const allDone = doneCount === setsArr.length && setsArr.length > 0

              // Subtitle
              const sub = []
              if (ex.sets) sub.push(`${ex.sets} sets`)
              if (mode === 'kracht') {
                if (ex.reps) sub.push(`${ex.reps} reps`)
                if (ex.weight_kg) sub.push(`${ex.weight_kg}kg`)
              } else if (mode === 'conditie') {
                if (meta._metric === 'afstand' && meta.distance_m) sub.push(`${meta.distance_m}m`)
                if (meta._metric === 'tijd' && meta.duration) sub.push(meta.duration)
                if (meta._zone) sub.push(meta._zone)
              } else if (mode === 'mobiliteit') {
                if (meta.hold_sec) sub.push(`${meta.hold_sec}s`)
              }
              if (ex.rest_seconds) sub.push(`Rust ${ex.rest_seconds}s`)

              return (
                <div key={ex.id} style={{ borderBottom: i < session.session_exercises.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {/* Exercise row — always visible */}
                  <button onClick={() => setActiveExercise(isActive ? null : ex.id)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    {/* Index / done indicator */}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: allDone ? '#4ade80' : isActive ? 'var(--orange)' : 'var(--dark3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                      {allDone
                        ? <span style={{ fontSize: 13 }}>✓</span>
                        : <span style={{ ...D, fontSize: 12, fontWeight: 700, color: isActive ? '#000' : 'var(--muted)' }}>{i + 1}</span>
                      }
                    </div>

                    {/* Name + subtitle */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...D, fontSize: 15, fontWeight: 700, color: allDone ? 'var(--muted)' : 'var(--text)', letterSpacing: 0.3, textDecoration: allDone ? 'line-through' : 'none' }}>{name}</div>
                      <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub.join(' · ')}</div>
                    </div>

                    {/* Mode badge + progress */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ ...B, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 6px', borderRadius: 3, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      {!allDone && setsArr.length > 0 && (
                        <span style={{ ...B, fontSize: 10, color: 'var(--muted)' }}>{doneCount}/{setsArr.length}</span>
                      )}
                    </div>

                    <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{isActive ? '▲' : '▼'}</span>
                  </button>

                  {/* Expanded set input */}
                  {isActive && (
                    <div style={{ padding: '0 16px 16px', background: 'var(--dark2)' }}>
                      {mode === 'kracht' && (
                        <>
                          {/* Header row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, marginBottom: 6, paddingTop: 8 }}>
                            {['SET','REPS','KG',''].map(h => (
                              <div key={h} style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textAlign: 'center' }}>{h}</div>
                            ))}
                          </div>
                          {setsArr.map((set, j) => {
                            const done = completedSets[`${ex.id}-${j}`]
                            return (
                              <div key={j} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, marginBottom: 6, opacity: done ? 0.5 : 1 }}>
                                <div style={{ ...D, fontSize: 13, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j+1}</div>
                                <input type="number" placeholder={ex.reps || '—'} value={set.reps} onChange={e => updateLog(ex.id, j, 'reps', e.target.value)} disabled={done}
                                  style={{ background: done ? 'var(--dark4)' : 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 700, padding: '10px 8px', outline: 'none', textAlign: 'center', colorScheme: 'dark' }} />
                                <input type="number" step="0.5" placeholder={ex.weight_kg ? String(ex.weight_kg) : '—'} value={set.weight} onChange={e => updateLog(ex.id, j, 'weight', e.target.value)} disabled={done}
                                  style={{ background: done ? 'var(--dark4)' : 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 700, padding: '10px 8px', outline: 'none', textAlign: 'center', colorScheme: 'dark' }} />
                                <button onClick={() => toggleSetDone(ex.id, j)}
                                  style={{ background: done ? 'rgba(74,222,128,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#4ade80' : 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>
                                  {done ? '✓' : '○'}
                                </button>
                              </div>
                            )
                          })}
                        </>
                      )}

                      {mode === 'conditie' && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 36px', gap: 6, marginBottom: 6, paddingTop: 8 }}>
                            {['SET', meta._metric === 'afstand' ? 'AFSTAND' : 'TIJD', ''].map(h => (
                              <div key={h} style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textAlign: 'center' }}>{h}</div>
                            ))}
                          </div>
                          {setsArr.map((_, j) => {
                            const done = completedSets[`${ex.id}-${j}`]
                            const placeholder = meta._metric === 'afstand' ? (meta.distance_m ? `${meta.distance_m}m` : '—') : (meta.duration || '—')
                            return (
                              <div key={j} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 36px', gap: 6, marginBottom: 6, opacity: done ? 0.5 : 1 }}>
                                <div style={{ ...D, fontSize: 13, fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j+1}</div>
                                <div style={{ background: done ? 'rgba(74,222,128,0.08)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', ...B, fontSize: 14, fontWeight: 700, color: done ? '#4ade80' : 'var(--muted)', textAlign: 'center' }}>
                                  {placeholder}
                                </div>
                                <button onClick={() => toggleSetDone(ex.id, j)}
                                  style={{ background: done ? 'rgba(74,222,128,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#4ade80' : 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>
                                  {done ? '✓' : '○'}
                                </button>
                              </div>
                            )
                          })}
                          {meta._zone && (
                            <div style={{ marginTop: 8 }}>
                              <span style={{ ...B, fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>🎯 {meta._zone}</span>
                            </div>
                          )}
                        </>
                      )}

                      {mode === 'mobiliteit' && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 36px', gap: 6, marginBottom: 6, paddingTop: 8 }}>
                            {['SET','VASTHOUD',''].map(h => (
                              <div key={h} style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textAlign: 'center' }}>{h}</div>
                            ))}
                          </div>
                          {setsArr.map((_, j) => {
                            const done = completedSets[`${ex.id}-${j}`]
                            return (
                              <div key={j} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 36px', gap: 6, marginBottom: 6, opacity: done ? 0.5 : 1 }}>
                                <div style={{ ...D, fontSize: 13, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j+1}</div>
                                <div style={{ background: done ? 'rgba(96,165,250,0.08)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(96,165,250,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', ...B, fontSize: 14, fontWeight: 700, color: done ? '#60a5fa' : 'var(--muted)', textAlign: 'center' }}>
                                  {meta.hold_sec ? `${meta.hold_sec}s` : '—'}
                                </div>
                                <button onClick={() => toggleSetDone(ex.id, j)}
                                  style={{ background: done ? 'rgba(96,165,250,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#60a5fa' : 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>
                                  {done ? '✓' : '○'}
                                </button>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* RPE */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '16px', marginBottom: 10 }}>
            <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Hoe zwaar was de training?</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...D, fontSize: 30, fontWeight: 700, color: rpeColor }}>{rpe}</span>
              <span style={{ ...B, fontSize: 13, color: rpeColor }}>{RPE_LABELS[rpe]}</span>
            </div>
            <input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(parseInt(e.target.value))} style={{ width: '100%', accentColor: rpeColor }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 9, color: 'var(--muted2)', marginTop: 4 }}>
              <span>1 — Licht</span><span>10 — Max</span>
            </div>
          </div>

          {/* Notities */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '16px', marginBottom: 16 }}>
            <label style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Notities</label>
            <textarea placeholder="Hoe voelde de training?" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, padding: '10px 12px', outline: 'none', width: '100%', resize: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
          </div>

          {status === 'error' && (
            <div style={{ ...B, fontSize: 13, color: '#f87171', padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 12 }}>
              Er ging iets mis. Probeer opnieuw.
            </div>
          )}

          <button onClick={handleSave} disabled={status === 'loading'}
            style={{ background: status === 'loading' ? 'var(--muted2)' : progress === 100 ? '#4ade80' : 'var(--orange)', borderRadius: 'var(--r-btn)', color: '#000', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', width: '100%' }}>
            {status === 'loading' ? 'OPSLAAN...' : progress === 100 ? '✓ TRAINING VOLTOOIEN' : `VOLTOOIEN (${progress}%)`}
          </button>
        </>)}
      </main>
    </div>
  )
}
