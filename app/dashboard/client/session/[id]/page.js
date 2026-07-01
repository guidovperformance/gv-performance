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
  kracht:     { color: 'var(--orange)',  bg: 'rgba(212,168,87,0.12)',   label: 'KRACHT' },
  conditie:   { color: '#4ade80',        bg: 'rgba(74,222,128,0.12)', label: 'CONDITIE' },
  mobiliteit: { color: '#60a5fa',        bg: 'rgba(96,165,250,0.12)', label: 'MOBILITEIT' },
}

const AUTOSAVE_DEBOUNCE_MS = 900

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
  const [errorMsg, setErrorMsg] = React.useState('')
  const [clientId, setClientId] = React.useState(null)
  const [previous, setPrevious] = React.useState({})
  const [viewMode, setViewMode] = React.useState('active') // 'active' | 'readonly'
  const [editing, setEditing] = React.useState(false)
  const [autosaveState, setAutosaveState] = React.useState('idle') // 'idle' | 'saving' | 'saved'
  const router = useRouter()
  const supabase = createClient()

  const autosaveTimer = React.useRef(null)
  const sessionRef = React.useRef(null)
  const logsRef = React.useRef({})
  const completedSetsRef = React.useRef({})
  const activeExerciseRef = React.useRef(null)
  const rpeRef = React.useRef(7)
  const notesRef = React.useRef('')

  React.useEffect(() => { if (sessionId) loadSession(sessionId) }, [sessionId])

  const loadSession = async (sid) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).maybeSingle()
    if (!cp) return
    setClientId(cp.id)

    const { data } = await supabase.from('training_sessions').select('*, session_exercises(*)').eq('id', sid).maybeSingle()
    if (!data) { router.push('/dashboard/client/week'); return }
    if (data.session_exercises) {
      data.session_exercises.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    }
    setSession(data)
    sessionRef.current = data

    // Bestaande log + "vorige keer"-historie ophalen
    let progress = null
    try {
      const res = await fetch(`/api/dashboard/session-progress?session_id=${sid}`)
      if (res.ok) progress = await res.json()
    } catch { /* val terug op lege sessie hieronder */ }

    setPrevious(progress?.previous || {})

    const sessionLog = progress?.session_log || null
    const exLogsByExercise = {}
    ;(sessionLog?.exercise_logs || []).forEach(l => {
      if (!exLogsByExercise[l.session_exercise_id]) exLogsByExercise[l.session_exercise_id] = []
      exLogsByExercise[l.session_exercise_id].push(l)
    })

    const init = {}
    const doneInit = {}
    data.session_exercises?.forEach(ex => {
      const existing = exLogsByExercise[ex.id] || []
      init[ex.id] = Array.from({ length: ex.sets || 3 }, (_, i) => {
        const found = existing.find(l => l.set_number === i + 1)
        if (found) {
          if (found.completed) doneInit[`${ex.id}-${i}`] = true
          return { reps: found.reps_performed != null ? String(found.reps_performed) : '', weight: found.weight_kg != null ? String(found.weight_kg) : '' }
        }
        return { reps: '', weight: ex.weight_kg ? String(ex.weight_kg) : '' }
      })
    })
    setLogs(init)
    logsRef.current = init
    setCompletedSets(doneInit)
    completedSetsRef.current = doneInit

    if (sessionLog?.status === 'voltooid') {
      setViewMode('readonly')
      setRpe(sessionLog.rpe || 7)
      rpeRef.current = sessionLog.rpe || 7
      setNotes(sessionLog.notes || '')
      notesRef.current = sessionLog.notes || ''
      setActiveExercise(data.session_exercises?.[0]?.id || null)
    } else {
      setViewMode('active')
      if (sessionLog) {
        setRpe(sessionLog.rpe || 7)
        rpeRef.current = sessionLog.rpe || 7
        setNotes(sessionLog.notes || '')
        notesRef.current = sessionLog.notes || ''
      }
      const resumeExercise = sessionLog?.current_exercise_id && data.session_exercises?.some(e => e.id === sessionLog.current_exercise_id)
        ? sessionLog.current_exercise_id
        : data.session_exercises?.[0]?.id || null
      setActiveExercise(resumeExercise)
      activeExerciseRef.current = resumeExercise
    }
  }

  // ── Autosave ──────────────────────────────────────────────────────────
  const buildSetsPayload = () => {
    const sets = []
    for (const ex of sessionRef.current?.session_exercises || []) {
      const arr = logsRef.current[ex.id] || []
      for (let i = 0; i < arr.length; i++) {
        const set = arr[i]
        const done = !!completedSetsRef.current[`${ex.id}-${i}`]
        if (!set.reps && !set.weight && !done) continue
        sets.push({
          session_exercise_id: ex.id,
          set_number: i + 1,
          reps_performed: set.reps ? parseInt(set.reps) : null,
          weight_kg: set.weight ? parseFloat(set.weight) : null,
          completed: done,
        })
      }
    }
    return sets
  }

  const flushAutosave = React.useCallback(async () => {
    if (!sessionRef.current || viewMode !== 'active') return
    setAutosaveState('saving')
    try {
      await fetch('/api/dashboard/session-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionRef.current.id,
          rpe: rpeRef.current,
          notes: notesRef.current || null,
          current_exercise_id: activeExerciseRef.current,
          sets: buildSetsPayload(),
        }),
      })
      setAutosaveState('saved')
    } catch {
      setAutosaveState('idle')
    }
  }, [viewMode])

  const scheduleAutosave = React.useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(flushAutosave, AUTOSAVE_DEBOUNCE_MS)
  }, [flushAutosave])

  // Best-effort flush bij verlaten/verbergen van de pagina
  React.useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushAutosave()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flushAutosave)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flushAutosave)
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [flushAutosave])

  const updateLog = (exId, setIdx, field, val) => {
    setLogs(prev => {
      const next = { ...prev, [exId]: prev[exId].map((s, i) => i === setIdx ? { ...s, [field]: val } : s) }
      logsRef.current = next
      return next
    })
    scheduleAutosave()
  }

  const toggleSetDone = (exId, setIdx) => {
    setCompletedSets(prev => {
      const key = `${exId}-${setIdx}`
      const next = { ...prev, [key]: !prev[key] }
      completedSetsRef.current = next
      const ex = session.session_exercises.find(e => e.id === exId)
      const allDone = Array.from({ length: ex.sets || 3 }, (_, j) => next[`${exId}-${j}`]).every(Boolean)
      if (allDone && !prev[key]) {
        const idx = session.session_exercises.findIndex(e => e.id === exId)
        const nextEx = session.session_exercises[idx + 1]
        if (nextEx) setTimeout(() => setActiveExerciseAndSave(nextEx.id), 400)
      }
      return next
    })
    flushAutosave()
  }

  const setActiveExerciseAndSave = (exId) => {
    setActiveExercise(exId)
    activeExerciseRef.current = exId
    flushAutosave()
  }

  const handleSave = async () => {
    if (!clientId || !session) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const sets = buildSetsPayload()
      const res = await fetch('/api/dashboard/save-session-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, rpe, notes: notes || null, sets }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Opslaan mislukt')

      setStatus('success')
      setTimeout(() => router.push('/dashboard/client'), 2000)
    } catch (e) {
      setErrorMsg(e.message || 'Er ging iets mis.')
      setStatus('error')
    }
  }

  const handleSaveEdit = async () => {
    if (!clientId || !session) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const sets = buildSetsPayload()
      const res = await fetch('/api/dashboard/save-session-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, rpe, notes: notes || null, sets }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Opslaan mislukt')
      setStatus('idle')
      setEditing(false)
    } catch (e) {
      setErrorMsg(e.message || 'Er ging iets mis.')
      setStatus('error')
    }
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

  const isReadonly = viewMode === 'readonly' && !editing

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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <span className="badge badge-orange" style={{ marginBottom: 6 }}>{session.session_type}</span>
              <div style={{ ...D, fontSize: 26, fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>{session.session_name}</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                {session.session_exercises?.length} oefeningen · {totalSets} sets totaal
              </div>
            </div>
            {viewMode === 'readonly' && (
              <span style={{ ...B, fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '5px 10px', borderRadius: 6, background: 'rgba(74,222,128,0.15)', color: '#4ade80', flexShrink: 0, marginTop: 2 }}>✓ VOLTOOID</span>
            )}
          </div>

          {session.notes && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '2px solid var(--orange)', borderRadius: 'var(--r-card)', padding: '10px 14px', marginBottom: 16, ...B, fontSize: 13, color: 'var(--text)', fontStyle: 'italic' }}>
              💬 {session.notes}
            </div>
          )}

          {isReadonly ? (
            <button onClick={() => setEditing(true)}
              style={{ background: 'var(--card)', border: '1px solid var(--border-orange)', borderRadius: 'var(--r-btn)', padding: '10px 16px', ...B, fontSize: 12, fontWeight: 700, color: 'var(--orange)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, cursor: 'pointer', width: '100%' }}>
              ✎ Waarden bewerken
            </button>
          ) : viewMode === 'active' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 1, marginBottom: 6 }}>
              <span>VOORTGANG</span>
              <span>
                {autosaveState === 'saving' ? '● Opslaan...' : autosaveState === 'saved' ? '✓ Opgeslagen' : ''}
                {'  '}{doneSets}/{totalSets} SETS
              </span>
            </div>
          ) : null}

          {viewMode === 'active' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 4, background: 'var(--dark3)', borderRadius: 2 }}>
                <div style={{ height: 4, background: progress === 100 ? '#4ade80' : 'var(--orange)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Oefeningenlijst */}
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
              const prevForEx = previous[name]

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
                  <button onClick={() => setActiveExerciseAndSave(isActive ? null : ex.id)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: allDone ? '#4ade80' : isActive ? 'var(--orange)' : 'var(--dark3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                      {allDone
                        ? <span style={{ fontSize: 13 }}>✓</span>
                        : <span style={{ ...D, fontSize: 12, fontWeight: 700, color: isActive ? '#000' : 'var(--muted)' }}>{i + 1}</span>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...D, fontSize: 15, fontWeight: 700, color: allDone ? 'var(--muted)' : 'var(--text)', letterSpacing: 0.3, textDecoration: allDone ? 'line-through' : 'none' }}>{name}</div>
                      <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub.join(' · ')}</div>
                      {prevForEx?.weight_kg != null && (
                        <div style={{ ...B, fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>Vorige keer: {prevForEx.weight_kg}kg{prevForEx.reps_performed ? ` × ${prevForEx.reps_performed}` : ''}</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ ...B, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 6px', borderRadius: 3, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      {!allDone && setsArr.length > 0 && (
                        <span style={{ ...B, fontSize: 10, color: 'var(--muted)' }}>{doneCount}/{setsArr.length}</span>
                      )}
                    </div>

                    <span style={{ ...B, fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{isActive ? '▲' : '▼'}</span>
                  </button>

                  {isActive && (
                    <div style={{ padding: '0 16px 16px', background: 'var(--dark2)' }}>
                      {mode === 'kracht' && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: isReadonly ? '28px 1fr 1fr' : '28px 1fr 1fr 36px', gap: 6, marginBottom: 6, paddingTop: 8 }}>
                            {(isReadonly ? ['SET','REPS','KG'] : ['SET','REPS','KG','']).map(h => (
                              <div key={h} style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textAlign: 'center' }}>{h}</div>
                            ))}
                          </div>
                          {setsArr.map((set, j) => {
                            const done = completedSets[`${ex.id}-${j}`]
                            if (isReadonly) {
                              return (
                                <div key={j} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: 6, marginBottom: 6 }}>
                                  <div style={{ ...D, fontSize: 13, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j+1}</div>
                                  <div style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 700, padding: '10px 8px', textAlign: 'center' }}>{set.reps || '—'}</div>
                                  <div style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 700, padding: '10px 8px', textAlign: 'center' }}>{set.weight || '—'}</div>
                                </div>
                              )
                            }
                            return (
                              <div key={j} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, marginBottom: 6, opacity: done ? 0.5 : 1 }}>
                                <div style={{ ...D, fontSize: 13, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{j+1}</div>
                                <input type="number" placeholder={ex.reps || '—'} value={set.reps} onChange={e => updateLog(ex.id, j, 'reps', e.target.value)} disabled={done && viewMode === 'active'}
                                  style={{ background: done ? 'var(--dark4)' : 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 700, padding: '10px 8px', outline: 'none', textAlign: 'center', colorScheme: 'dark' }} />
                                <input type="number" step="0.5" placeholder={ex.weight_kg ? String(ex.weight_kg) : '—'} value={set.weight} onChange={e => updateLog(ex.id, j, 'weight', e.target.value)} disabled={done && viewMode === 'active'}
                                  style={{ background: done ? 'var(--dark4)' : 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 700, padding: '10px 8px', outline: 'none', textAlign: 'center', colorScheme: 'dark' }} />
                                {viewMode === 'active' && (
                                  <button onClick={() => toggleSetDone(ex.id, j)}
                                    style={{ background: done ? 'rgba(74,222,128,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#4ade80' : 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>
                                    {done ? '✓' : '○'}
                                  </button>
                                )}
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
                                {viewMode === 'active' && (
                                  <button onClick={() => toggleSetDone(ex.id, j)}
                                    style={{ background: done ? 'rgba(74,222,128,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#4ade80' : 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>
                                    {done ? '✓' : '○'}
                                  </button>
                                )}
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
                                {viewMode === 'active' && (
                                  <button onClick={() => toggleSetDone(ex.id, j)}
                                    style={{ background: done ? 'rgba(96,165,250,0.2)' : 'var(--dark3)', border: `1px solid ${done ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`, borderRadius: 8, color: done ? '#60a5fa' : 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>
                                    {done ? '✓' : '○'}
                                  </button>
                                )}
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
            <input type="range" min="1" max="10" value={rpe} disabled={isReadonly}
              onChange={e => { const v = parseInt(e.target.value); setRpe(v); rpeRef.current = v; scheduleAutosave() }}
              style={{ width: '100%', accentColor: rpeColor }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 9, color: 'var(--muted2)', marginTop: 4 }}>
              <span>1 — Licht</span><span>10 — Max</span>
            </div>
          </div>

          {/* Notities */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '16px', marginBottom: 16 }}>
            <label style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Notities</label>
            <textarea placeholder="Hoe voelde de training?" rows={2} value={notes} disabled={isReadonly}
              onChange={e => { setNotes(e.target.value); notesRef.current = e.target.value; scheduleAutosave() }}
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, padding: '10px 12px', outline: 'none', width: '100%', resize: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
          </div>

          {status === 'error' && (
            <div style={{ ...B, fontSize: 13, color: '#f87171', padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 12 }}>
              {errorMsg || 'Er ging iets mis. Probeer opnieuw.'}
            </div>
          )}

          {viewMode === 'active' ? (
            <button onClick={handleSave} disabled={status === 'loading'}
              style={{ background: status === 'loading' ? 'var(--muted2)' : progress === 100 ? '#4ade80' : 'var(--orange)', borderRadius: 'var(--r-btn)', color: '#000', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', width: '100%' }}>
              {status === 'loading' ? 'OPSLAAN...' : progress === 100 ? '✓ TRAINING VOLTOOIEN' : `VOLTOOIEN (${progress}%)`}
            </button>
          ) : editing ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(false)} disabled={status === 'loading'}
                style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-btn)', color: 'var(--text)', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', padding: '16px', cursor: 'pointer' }}>
                Annuleren
              </button>
              <button onClick={handleSaveEdit} disabled={status === 'loading'}
                style={{ flex: 2, background: status === 'loading' ? 'var(--muted2)' : '#4ade80', borderRadius: 'var(--r-btn)', color: '#000', fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
                {status === 'loading' ? 'OPSLAAN...' : '✓ WIJZIGINGEN OPSLAAN'}
              </button>
            </div>
          ) : null}
        </>)}
      </main>
    </div>
  )
}
