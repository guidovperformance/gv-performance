'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const inp = { background: 'var(--dark3)', border: '1px solid var(--dark4)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 15, padding: '14px 16px', outline: 'none', width: '100%' }
const lbl = { fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }

// Stap 1: Macro plan aanmaken
// Stap 2: Meso cycli (weken) instellen
// Stap 3: Trainingen per dag aanmaken (micro)

export default function NewPlan({ params }) {
  const [clientId, setClientId] = React.useState(null)
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Macro plan state
  const [macro, setMacro] = React.useState({ name: '', goal: '', phase: 'opbouw', start_date: '', end_date: '', notes: '' })
  const [macroId, setMacroId] = React.useState(null)

  // Meso cycles state
  const [mesoCount, setMesoCount] = React.useState(4)
  const [mesos, setMesos] = React.useState([])
  const [mesoIds, setMesoIds] = React.useState([])

  // Training sessions state (micro)
  const [selectedMeso, setSelectedMeso] = React.useState(0)
  const [sessions, setSessions] = React.useState({})

  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    params.then(p => setClientId(p.id))
  }, [params])

  // Genereer lege meso cycli op basis van aantal weken
  React.useEffect(() => {
    const newMesos = Array.from({ length: mesoCount }, (_, i) => ({
      week_number: i + 1,
      focus: i === mesoCount - 1 ? 'herstel' : 'kracht',
      intensity: i === mesoCount - 1 ? 'low' : 'medium',
      notes: ''
    }))
    setMesos(newMesos)
  }, [mesoCount])

  const setMeso = (i, field, val) => setMesos(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  // Stap 1 → 2: Sla macro plan op
  const saveMacro = async () => {
    if (!macro.name || !macro.start_date) { setError('Naam en startdatum zijn verplicht.'); return }
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase.from('macro_plans').insert({
      client_id: clientId,
      coach_id: user.id,
      name: macro.name,
      goal: macro.goal,
      phase: macro.phase,
      start_date: macro.start_date,
      end_date: macro.end_date || null,
      notes: macro.notes,
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setMacroId(data.id)
    setStep(2)
    setLoading(false)
  }

  // Stap 2 → 3: Sla meso cycli op
  const saveMesos = async () => {
    setLoading(true); setError('')
    const startDate = new Date(macro.start_date)
    const insertData = mesos.map((m, i) => {
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + i * 7)
      return {
        macro_plan_id: macroId,
        week_number: m.week_number,
        focus: m.focus,
        intensity: m.intensity,
        start_date: weekStart.toISOString().split('T')[0],
        notes: m.notes,
      }
    })
    const { data, error: err } = await supabase.from('meso_cycles').insert(insertData).select()
    if (err) { setError(err.message); setLoading(false); return }
    setMesoIds(data.map(d => d.id))
    const initialSessions = {}
    data.forEach((_, i) => { initialSessions[i] = [] })
    setSessions(initialSessions)
    setStep(3)
    setLoading(false)
  }

  // Voeg training toe aan een week
  const addSession = (weekIdx) => {
    setSessions(prev => ({
      ...prev,
      [weekIdx]: [...(prev[weekIdx] || []), { name: '', type: 'kracht', day: 'Maandag', exercises: [] }]
    }))
  }

  const removeSession = (weekIdx, sIdx) => {
    setSessions(prev => ({ ...prev, [weekIdx]: prev[weekIdx].filter((_, i) => i !== sIdx) }))
  }

  const setSession = (weekIdx, sIdx, field, val) => {
    setSessions(prev => ({
      ...prev,
      [weekIdx]: prev[weekIdx].map((s, i) => i === sIdx ? { ...s, [field]: val } : s)
    }))
  }

  // Voeg oefening toe aan sessie
  const addExercise = (weekIdx, sIdx) => {
    setSessions(prev => ({
      ...prev,
      [weekIdx]: prev[weekIdx].map((s, i) => i === sIdx ? {
        ...s, exercises: [...s.exercises, { name: '', sets: 3, reps: '8-10', weight: '', rest: 90, notes: '' }]
      } : s)
    }))
  }

  const setExercise = (weekIdx, sIdx, eIdx, field, val) => {
    setSessions(prev => ({
      ...prev,
      [weekIdx]: prev[weekIdx].map((s, i) => i === sIdx ? {
        ...s, exercises: s.exercises.map((ex, j) => j === eIdx ? { ...ex, [field]: val } : ex)
      } : s)
    }))
  }

  const removeExercise = (weekIdx, sIdx, eIdx) => {
    setSessions(prev => ({
      ...prev,
      [weekIdx]: prev[weekIdx].map((s, i) => i === sIdx ? {
        ...s, exercises: s.exercises.filter((_, j) => j !== eIdx)
      } : s)
    }))
  }

  // Sla alles op en klaar
  const saveSessions = async () => {
    setLoading(true); setError('')
    try {
      for (const [weekIdxStr, weekSessions] of Object.entries(sessions)) {
        const weekIdx = parseInt(weekIdxStr)
        const mesoId = mesoIds[weekIdx]
        for (const session of weekSessions) {
          const weekStart = new Date(macro.start_date)
          weekStart.setDate(weekStart.getDate() + weekIdx * 7)
          const days = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag']
          const dayOffset = days.indexOf(session.day)
          const sessionDate = new Date(weekStart)
          sessionDate.setDate(weekStart.getDate() + (dayOffset >= 0 ? dayOffset : 0))

          const { data: sessionData } = await supabase.from('training_sessions').insert({
            meso_cycle_id: mesoId,
            client_id: clientId,
            session_date: sessionDate.toISOString().split('T')[0],
            day_of_week: dayOffset + 1,
            session_name: session.name,
            session_type: session.type,
          }).select().single()

          if (sessionData && session.exercises.length > 0) {
            // Zoek of maak oefeningen aan
            for (const [eIdx, ex] of session.exercises.entries()) {
              if (!ex.name) continue
              let { data: exData } = await supabase.from('exercises').select('id').eq('name', ex.name).single()
              if (!exData) {
                const { data: newEx } = await supabase.from('exercises').insert({ name: ex.name, category: 'anders' }).select().single()
                exData = newEx
              }
              if (exData) {
                await supabase.from('session_exercises').insert({
                  session_id: sessionData.id,
                  exercise_id: exData.id,
                  order_index: eIdx,
                  sets: parseInt(ex.sets) || 3,
                  reps: ex.reps || '8-10',
                  weight_kg: ex.weight ? parseFloat(ex.weight) : null,
                  rest_seconds: parseInt(ex.rest) || 90,
                  notes: ex.notes || null,
                })
              }
            }
          }
        }
      }
      router.push(`/dashboard/coach/clients/${clientId}`)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
  const focusOptions = ['kracht', 'conditie', 'snelheid', 'mobiliteit', 'herstel', 'mixed']
  const intensityOptions = { low: 'Laag', medium: 'Gemiddeld', high: 'Hoog', deload: 'Deload' }

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

      {/* Stap indicator */}
      <div style={{ background: 'var(--dark2)', padding: '20px 40px', display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,77,0,0.1)' }}>
        {[['01', 'MACRO PLAN'], ['02', 'WEKEN (MESO)'], ['03', 'TRAININGEN (MICRO)']].map(([num, label], i) => (
          <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i + 1 ? 'var(--orange)' : step === i + 1 ? 'var(--orange)' : 'var(--dark4)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 12, fontWeight: 700, color: step >= i + 1 ? '#000' : 'var(--muted)' }}>{num}</div>
              <span style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: step >= i + 1 ? 'var(--text)' : 'var(--muted)' }}>{label}</span>
            </div>
            {i < 2 && <div style={{ width: 40, height: 1, background: step > i + 1 ? 'var(--orange)' : 'var(--dark4)', margin: '0 16px' }} />}
          </div>
        ))}
      </div>

      <main style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>

        {error && <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', marginBottom: 24 }}>{error}</div>}

        {/* STAP 1: MACRO */}
        {step === 1 && (
          <div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>MACRO PLAN</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Het grote plaatje — de periode en het hoofddoel van dit traject.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={lbl}>Plannaam *</label>
                <input type="text" placeholder="Pre-season 2025, Hyrox Amsterdam voorbereiding..." value={macro.name} onChange={e => setMacro(p => ({...p, name: e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Hoofddoel</label>
                <input type="text" placeholder="Kracht opbouwen, conditie verbeteren, selectie voorbereiden..." value={macro.goal} onChange={e => setMacro(p => ({...p, goal: e.target.value}))} style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={lbl}>Fase</label>
                  <select value={macro.phase} onChange={e => setMacro(p => ({...p, phase: e.target.value}))} style={inp}>
                    {['opbouw', 'kracht', 'piek', 'herstel', 'conditie'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Startdatum *</label>
                  <input type="date" value={macro.start_date} onChange={e => setMacro(p => ({...p, start_date: e.target.value}))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Einddatum</label>
                  <input type="date" value={macro.end_date} onChange={e => setMacro(p => ({...p, end_date: e.target.value}))} style={inp} />
                </div>
              </div>
              <div>
                <label style={lbl}>Notities</label>
                <textarea placeholder="Aanvullende informatie over dit traject..." rows={3} value={macro.notes} onChange={e => setMacro(p => ({...p, notes: e.target.value}))} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <button onClick={saveMacro} disabled={loading} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: 16, border: 'none', cursor: 'pointer', alignSelf: 'flex-start', paddingLeft: 40, paddingRight: 40 }}>
                {loading ? 'OPSLAAN...' : 'VERDER: WEKEN INSTELLEN →'}
              </button>
            </div>
          </div>
        )}

        {/* STAP 2: MESO */}
        {step === 2 && (
          <div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>WEKEN INSTELLEN</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Stel per week de focus en intensiteit in. De laatste week is standaard een deload/herstelweek.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Aantal weken:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[4, 6, 8, 10, 12].map(n => (
                  <button key={n} onClick={() => setMesoCount(n)} style={{ background: mesoCount === n ? 'var(--orange)' : 'var(--dark3)', color: mesoCount === n ? '#000' : 'var(--text)', ...B, fontWeight: 700, fontSize: 13, padding: '8px 16px', border: 'none', cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
              {mesos.map((m, i) => (
                <div key={i} style={{ background: 'var(--dark2)', padding: '20px 24px', display: 'grid', gridTemplateColumns: '60px 1fr 1fr 2fr', gap: 16, alignItems: 'center' }}>
                  <div style={{ ...D, fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>W{m.week_number}</div>
                  <div>
                    <label style={{ ...lbl, marginBottom: 4 }}>Focus</label>
                    <select value={m.focus} onChange={e => setMeso(i, 'focus', e.target.value)} style={{ ...inp, padding: '10px 12px' }}>
                      {focusOptions.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom: 4 }}>Intensiteit</label>
                    <select value={m.intensity} onChange={e => setMeso(i, 'intensity', e.target.value)} style={{ ...inp, padding: '10px 12px' }}>
                      {Object.entries(intensityOptions).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom: 4 }}>Notities</label>
                    <input type="text" placeholder="Optionele toelichting..." value={m.notes} onChange={e => setMeso(i, 'notes', e.target.value)} style={{ ...inp, padding: '10px 12px' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => setStep(1)} style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 28px', background: 'none', cursor: 'pointer' }}>← Terug</button>
              <button onClick={saveMesos} disabled={loading} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 32px', border: 'none', cursor: 'pointer' }}>
                {loading ? 'OPSLAAN...' : 'VERDER: TRAININGEN AANMAKEN →'}
              </button>
            </div>
          </div>
        )}

        {/* STAP 3: MICRO */}
        {step === 3 && (
          <div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TRAININGEN AANMAKEN</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Voeg per week de trainingen toe met oefeningen, sets en reps.</p>

            {/* Week selector */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
              {mesos.map((m, i) => (
                <button key={i} onClick={() => setSelectedMeso(i)} style={{ background: selectedMeso === i ? 'var(--orange)' : 'var(--dark2)', color: selectedMeso === i ? '#000' : 'var(--muted)', ...B, fontSize: 12, letterSpacing: 1, padding: '8px 14px', border: 'none', cursor: 'pointer' }}>
                  W{m.week_number} · {m.focus}
                </button>
              ))}
            </div>

            {/* Huidige week trainingen */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
                  WEEK {mesos[selectedMeso]?.week_number} — {mesos[selectedMeso]?.focus?.toUpperCase()}
                </div>
                <button onClick={() => addSession(selectedMeso)} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
                  + Dag toevoegen
                </button>
              </div>

              {(sessions[selectedMeso] || []).length === 0 ? (
                <div style={{ background: 'var(--dark2)', padding: 32, textAlign: 'center', ...B, fontSize: 14, color: 'var(--muted)' }}>
                  Nog geen trainingen voor deze week. Klik &ldquo;+ Dag toevoegen&rdquo;.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(sessions[selectedMeso] || []).map((session, sIdx) => (
                    <div key={sIdx} style={{ background: 'var(--dark2)', padding: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 20 }}>
                        <div>
                          <label style={lbl}>Sessienaam</label>
                          <input type="text" placeholder="Boven, Been, Full body..." value={session.name} onChange={e => setSession(selectedMeso, sIdx, 'name', e.target.value)} style={inp} />
                        </div>
                        <div>
                          <label style={lbl}>Type</label>
                          <select value={session.type} onChange={e => setSession(selectedMeso, sIdx, 'type', e.target.value)} style={inp}>
                            {['kracht', 'conditie', 'gecombineerd', 'mobiliteit', 'herstel'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Dag</label>
                          <select value={session.day} onChange={e => setSession(selectedMeso, sIdx, 'day', e.target.value)} style={inp}>
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <button onClick={() => removeSession(selectedMeso, sIdx)} style={{ background: 'none', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', cursor: 'pointer', padding: '0 12px', fontSize: 18, alignSelf: 'flex-end', height: 48 }}>✕</button>
                      </div>

                      {/* Oefeningen */}
                      <div style={{ background: 'var(--dark3)', padding: 16 }}>
                        <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 12 }}>Oefeningen</div>
                        {session.exercises.length === 0 ? (
                          <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Nog geen oefeningen toegevoegd</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                            {session.exercises.map((ex, eIdx) => (
                              <div key={eIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 80px 80px 1fr auto', gap: 8, alignItems: 'center' }}>
                                <input type="text" placeholder="Oefening" value={ex.name} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'name', e.target.value)} style={{ ...inp, padding: '10px 12px', fontSize: 13 }} />
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ ...B, fontSize: 9, letterSpacing: 1, color: 'var(--muted)', marginBottom: 2 }}>SETS</div>
                                  <input type="number" min="1" max="10" value={ex.sets} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'sets', e.target.value)} style={{ ...inp, padding: '10px 8px', fontSize: 13, textAlign: 'center' }} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ ...B, fontSize: 9, letterSpacing: 1, color: 'var(--muted)', marginBottom: 2 }}>REPS</div>
                                  <input type="text" placeholder="8-10" value={ex.reps} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'reps', e.target.value)} style={{ ...inp, padding: '10px 8px', fontSize: 13, textAlign: 'center' }} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ ...B, fontSize: 9, letterSpacing: 1, color: 'var(--muted)', marginBottom: 2 }}>KG</div>
                                  <input type="text" placeholder="—" value={ex.weight} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'weight', e.target.value)} style={{ ...inp, padding: '10px 8px', fontSize: 13, textAlign: 'center' }} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ ...B, fontSize: 9, letterSpacing: 1, color: 'var(--muted)', marginBottom: 2 }}>RUST (s)</div>
                                  <input type="number" value={ex.rest} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'rest', e.target.value)} style={{ ...inp, padding: '10px 8px', fontSize: 13, textAlign: 'center' }} />
                                </div>
                                <input type="text" placeholder="Notities" value={ex.notes} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'notes', e.target.value)} style={{ ...inp, padding: '10px 8px', fontSize: 12 }} />
                                <button onClick={() => removeExercise(selectedMeso, sIdx, eIdx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => addExercise(selectedMeso, sIdx)} style={{ background: 'none', border: '1px dashed var(--muted2)', color: 'var(--muted)', ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
                          + Oefening toevoegen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setStep(2)} style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 28px', background: 'none', cursor: 'pointer' }}>← Terug</button>
              <button onClick={saveSessions} disabled={loading} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 32px', border: 'none', cursor: 'pointer' }}>
                {loading ? 'OPSLAAN...' : '✓ PLAN OPSLAAN & AFRONDEN'}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
