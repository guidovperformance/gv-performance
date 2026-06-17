'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const inp = {
  background: 'var(--dark3)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--text)',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 15,
  padding: '14px 16px',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark',
}

const lbl = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 10,
  letterSpacing: 2,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function NewPlan({ params }) {
  const [clientId, setClientId] = React.useState(null)
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const [macro, setMacro] = React.useState({
    name: '', goal: '', phase: 'opbouw',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '', notes: ''
  })
  const [macroId, setMacroId] = React.useState(null)
  const [mesoCount, setMesoCount] = React.useState(4)
  const [mesos, setMesos] = React.useState([])
  const [mesoIds, setMesoIds] = React.useState([])
  const [selectedMeso, setSelectedMeso] = React.useState(0)
  const [sessions, setSessions] = React.useState({})

  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => { params.then(p => setClientId(p.id)) }, [params])

  React.useEffect(() => {
    const newMesos = Array.from({ length: mesoCount }, (_, i) => ({
      week_number: i + 1,
      focus: i === mesoCount - 1 ? 'herstel' : ['kracht', 'kracht', 'conditie', 'kracht'][i % 4] || 'kracht',
      intensity: i === mesoCount - 1 ? 'deload' : i % 4 === 2 ? 'high' : 'medium',
      notes: ''
    }))
    setMesos(newMesos)
  }, [mesoCount])

  const setMeso = (i, field, val) => setMesos(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const saveMacro = async () => {
    if (!macro.name) { setError('Geef het plan een naam.'); return }
    if (!macro.start_date) { setError('Kies een startdatum.'); return }
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase.from('macro_plans').insert({
      client_id: clientId, coach_id: user.id,
      name: macro.name, goal: macro.goal, phase: macro.phase,
      start_date: macro.start_date,
      end_date: macro.end_date || null,
      notes: macro.notes,
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setMacroId(data.id)
    setStep(2)
    setLoading(false)
  }

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
    const init = {}
    data.forEach((_, i) => { init[i] = [] })
    setSessions(init)
    setStep(3)
    setLoading(false)
  }

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

  const addExercise = (weekIdx, sIdx) => {
    const sessionType = sessions[weekIdx]?.[sIdx]?.type || 'kracht'
    // Altijd standaard kracht - coach past type aan per oefening
    const defaults = {
      name: '', sets: 3, reps: '8-10', weight: '', rest: 90, notes: '',
      ex_mode: 'kracht',
      distance: '400', tempo: '5:00', hold_s: '30', hold_type: 'statisch',
    }
    setSessions(prev => ({
      ...prev,
      [weekIdx]: prev[weekIdx].map((s, i) => i === sIdx ? {
        ...s, exercises: [...s.exercises, defaults]
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

  const saveSessions = async () => {
    setLoading(true); setError('')
    try {
      for (const [weekIdxStr, weekSessions] of Object.entries(sessions)) {
        const weekIdx = parseInt(weekIdxStr)
        const mesoId = mesoIds[weekIdx]
        for (const session of weekSessions) {
          const weekStart = new Date(macro.start_date)
          weekStart.setDate(weekStart.getDate() + weekIdx * 7)
          const days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
          const dayOffset = days.indexOf(session.day)
          const sessionDate = new Date(weekStart)
          sessionDate.setDate(weekStart.getDate() + (dayOffset >= 0 ? dayOffset : 0))

          const { data: sessionData } = await supabase.from('training_sessions').insert({
            meso_cycle_id: mesoId, client_id: clientId,
            session_date: sessionDate.toISOString().split('T')[0],
            day_of_week: dayOffset + 1,
            session_name: session.name || 'Training',
            session_type: session.type,
          }).select().single()

          if (sessionData && session.exercises.length > 0) {
            for (const [eIdx, ex] of session.exercises.entries()) {
              // Sla direct op via exercise_name — geen bibliotheek lookup meer
              const mode = ex.ex_mode || 'kracht'
              let exReps = null, exWeight = null, exNotes = null
              if (mode === 'conditie') {
                const tMin = ex.tempo ? (() => { const p = String(ex.tempo).split(':'); return parseInt(p[0]) + parseInt(p[1]||0)/60 })() : null
                const speed = tMin ? (60/tMin).toFixed(1) : null
                exNotes = JSON.stringify({
                  _mode:'conditie',
                  _metric: ex.cond_metric || 'afstand',
                  distance_m: ex.cond_metric !== 'tijd' ? (parseInt(ex.distance)||null) : null,
                  duration: ex.cond_metric === 'tijd' ? (ex.duration||null) : null,
                  rest_s: parseInt(ex.rest)||180,
                  tempo: ex.tempo||null,
                  speed_kmh: speed ? parseFloat(speed) : null,
                })
              } else if (mode === 'mobiliteit') {
                exNotes = JSON.stringify({ _mode:'mobiliteit', hold_s:parseInt(ex.hold_s)||30, hold_type:ex.hold_type||'statisch', rest_s:parseInt(ex.rest)||30 })
              } else {
                exReps = ex.reps || '8-10'
                exWeight = ex.weight ? parseFloat(ex.weight) : null
                exNotes = ex.notes || null
              }
              await supabase.from('session_exercises').insert({
                session_id: sessionData.id,
                exercise_name: ex.name || 'Oefening',
                order_index: eIdx, sets: parseInt(ex.sets) || 3,
                reps: exReps, weight_kg: exWeight,
                rest_seconds: parseInt(ex.rest) || 90,
                notes: exNotes,
              })
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
  const exInp = { background: 'var(--dark4)', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 13, padding: '8px', outline: 'none', width: '100%', colorScheme: 'dark' }

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
        {[['01', 'MACRO PLAN'], ['02', 'WEKEN (MESO)'], ['03', 'TRAININGEN']].map(([num, label], i) => (
          <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= i + 1 ? 'var(--orange)' : 'var(--dark4)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 12, fontWeight: 700, color: step >= i + 1 ? '#000' : 'var(--muted)' }}>{num}</div>
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
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Het grote plaatje — naam, doel en periode van dit traject.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={lbl}>Plannaam *</label>
                <input type="text" placeholder="Pre-season 2025, Hyrox Amsterdam voorbereiding..." value={macro.name} onChange={e => setMacro(p => ({...p, name: e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Hoofddoel</label>
                <input type="text" placeholder="Kracht opbouwen, conditie verbeteren..." value={macro.goal} onChange={e => setMacro(p => ({...p, goal: e.target.value}))} style={inp} />
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
                  <input
                    type="date"
                    value={macro.start_date}
                    onChange={e => setMacro(p => ({...p, start_date: e.target.value}))}
                    style={{ ...inp, cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={lbl}>Einddatum</label>
                  <input
                    type="date"
                    value={macro.end_date}
                    onChange={e => setMacro(p => ({...p, end_date: e.target.value}))}
                    style={{ ...inp, cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>Notities</label>
                <textarea placeholder="Extra informatie..." rows={3} value={macro.notes} onChange={e => setMacro(p => ({...p, notes: e.target.value}))} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <button onClick={saveMacro} disabled={loading} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '16px 40px', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                {loading ? 'OPSLAAN...' : 'VERDER →'}
              </button>
            </div>
          </div>
        )}

        {/* STAP 2: MESO */}
        {step === 2 && (
          <div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>WEKEN INSTELLEN</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Stel per week de focus en intensiteit in.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Aantal weken:</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[4, 6, 8, 10, 12].map(n => (
                  <button key={n} onClick={() => setMesoCount(n)} style={{ background: mesoCount === n ? 'var(--orange)' : 'var(--dark3)', color: mesoCount === n ? '#000' : 'var(--text)', ...B, fontWeight: 700, fontSize: 14, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
              {mesos.map((m, i) => (
                <div key={i} style={{ background: 'var(--dark2)', padding: '16px 20px', display: 'grid', gridTemplateColumns: '50px 1fr 1fr 2fr', gap: 16, alignItems: 'center' }}>
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
                    <input type="text" placeholder="Optioneel..." value={m.notes} onChange={e => setMeso(i, 'notes', e.target.value)} style={{ ...inp, padding: '10px 12px' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 24px', background: 'none', cursor: 'pointer' }}>← Terug</button>
              <button onClick={saveMesos} disabled={loading} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 32px', border: 'none', cursor: 'pointer' }}>
                {loading ? 'OPSLAAN...' : 'VERDER →'}
              </button>
            </div>
          </div>
        )}

        {/* STAP 3: MICRO */}
        {step === 3 && (
          <div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TRAININGEN AANMAKEN</h1>
            <p style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Voeg per week de trainingen toe. Je kunt dit later altijd aanpassen.</p>

            <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
              {mesos.map((m, i) => (
                <button key={i} onClick={() => setSelectedMeso(i)} style={{ background: selectedMeso === i ? 'var(--orange)' : 'var(--dark2)', color: selectedMeso === i ? '#000' : 'var(--muted)', ...B, fontSize: 12, letterSpacing: 1, padding: '8px 14px', border: 'none', cursor: 'pointer' }}>
                  W{m.week_number} · {m.focus}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ ...D, fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>WEEK {mesos[selectedMeso]?.week_number} — {mesos[selectedMeso]?.focus?.toUpperCase()}</div>
              <button onClick={() => addSession(selectedMeso)} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>+ Dag toevoegen</button>
            </div>

            {(sessions[selectedMeso] || []).length === 0 ? (
              <div style={{ background: 'var(--dark2)', padding: 32, textAlign: 'center', ...B, fontSize: 14, color: 'var(--muted)' }}>
                Klik &ldquo;+ Dag toevoegen&rdquo; om een training toe te voegen.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(sessions[selectedMeso] || []).map((session, sIdx) => (
                  <div key={sIdx} style={{ background: 'var(--dark2)', padding: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label style={lbl}>Naam</label>
                        <input type="text" placeholder="Kracht, Boven, Conditie..." value={session.name} onChange={e => setSession(selectedMeso, sIdx, 'name', e.target.value)} style={inp} />
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

                    <div style={{ background: 'var(--dark3)', padding: 16 }}>
                      <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 10 }}>Oefeningen</div>
                      {session.exercises.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          {session.exercises.map((ex, eIdx) => {
                            const sessionType = session.type
                            const mode = ex.ex_mode || 'kracht'
                            const isConditie   = mode === 'conditie'
                            const isMobiliteit = mode === 'mobiliteit'
                            const tMin = ex.tempo ? (() => { try { const p = String(ex.tempo).split(':'); return parseInt(p[0]) + parseInt(p[1]||0)/60 } catch { return null } })() : null
                            const speed = tMin && tMin > 0 ? (60/tMin).toFixed(1) : null
                            return (
                              <div key={eIdx} style={{ background: 'var(--dark4)', padding: '10px 12px', marginBottom: 6, borderRadius: 4 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px', gap: 6, marginBottom: 8 }}>
                                  <input type="text" placeholder="Naam oefening / activiteit" value={ex.name} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'name', e.target.value)} style={{...exInp, fontWeight: 600}} />
                                  <button onClick={() => removeExercise(selectedMeso, sIdx, eIdx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
                                </div>

                                {/* Type toggle — altijd zichtbaar voor elke oefening */}
                                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                                  {['kracht', 'conditie', 'mobiliteit'].map(m => (
                                    <button key={m} onClick={() => setExercise(selectedMeso, sIdx, eIdx, 'ex_mode', m)}
                                      style={{ flex: 1, padding: '5px 8px', background: mode === m ? (m==='kracht'?'#4ade80':m==='conditie'?'#38e8e8':'#a78bfa') : 'var(--dark3)', color: mode === m ? '#000' : 'var(--muted)', border: `1px solid ${mode === m ? (m==='kracht'?'#4ade80':m==='conditie'?'#38e8e8':'#a78bfa') : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, fontWeight: mode === m ? 700 : 400, textTransform: 'uppercase', letterSpacing: 1 }}>
                                      {m}
                                    </button>
                                  ))}
                                </div>

                                {/* KRACHT velden */}
                                {!isConditie && !isMobiliteit && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 80px 80px 1fr', gap: 6 }}>
                                    {[['Sets','number','sets','3',''],['Reps','text','reps','8-10',''],['KG','number','weight','—','0.5'],['Rust(s)','number','rest','90',''],['Notities','text','notes','Bijv. RIR 2','']].map(([h,t,f,ph,step]) => (
                                      <div key={f}>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{h}</div>
                                        <input type={t} placeholder={ph} value={ex[f]||''} step={step||undefined}
                                          onChange={e => setExercise(selectedMeso, sIdx, eIdx, f, e.target.value)} style={{...exInp, textAlign: ['sets','reps','weight','rest'].includes(f) ? 'center' : 'left'}} />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* CONDITIE velden */}
                                {isConditie && (
                                  <div>
                                    {/* Afstand vs Tijd toggle */}
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                      {['afstand', 'tijd'].map(m => (
                                        <button key={m} onClick={() => setExercise(selectedMeso, sIdx, eIdx, 'cond_metric', m)}
                                          style={{ flex: 1, padding: '4px', background: (ex.cond_metric||'afstand')===m ? '#38e8e8' : 'var(--dark3)', color: (ex.cond_metric||'afstand')===m ? '#000' : 'var(--muted)', border: `1px solid ${(ex.cond_metric||'afstand')===m ? '#38e8e8' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, fontWeight: (ex.cond_metric||'afstand')===m ? 700 : 400, textTransform: 'uppercase', letterSpacing: 1 }}>
                                          {m === 'afstand' ? '📏 Afstand' : '⏱ Tijd'}
                                        </button>
                                      ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '60px 110px 120px 90px', gap: 6, marginBottom: 6 }}>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Sets</div>
                                        <input type="number" value={ex.sets||4} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'sets', e.target.value)} style={{...exInp, textAlign:'center'}} placeholder="4" />
                                      </div>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
                                          {(ex.cond_metric||'afstand') === 'afstand' ? 'Afstand (m)' : 'Totale tijd (min:sec)'}
                                        </div>
                                        {(ex.cond_metric||'afstand') === 'afstand' ? (
                                          <input type="number" value={ex.distance||''} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'distance', e.target.value)} style={{...exInp, textAlign:'center'}} placeholder="400" />
                                        ) : (
                                          <input type="text" value={ex.duration||''} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'duration', e.target.value)} style={exInp} placeholder="4:00" />
                                        )}
                                      </div>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Tempo (min:sec/km)</div>
                                        <input type="text" value={ex.tempo||''} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'tempo', e.target.value)} style={exInp} placeholder="5:30" />
                                      </div>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Rust (s)</div>
                                        <input type="number" value={ex.rest||180} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'rest', e.target.value)} style={{...exInp, textAlign:'center'}} placeholder="180" />
                                      </div>
                                    </div>
                                    {speed && (
                                      <div style={{ background: 'rgba(56,232,232,0.08)', border: '1px solid rgba(56,232,232,0.2)', padding: '7px 12px', display: 'flex', gap: 16 }}>
                                        <span style={{ ...B, fontSize: 12, color: '#38e8e8' }}>⚡ <strong>{speed} km/h</strong></span>
                                        <span style={{ ...B, fontSize: 11, color: '#888' }}>{ex.tempo} min/km</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* MOBILITEIT velden */}
                                {isMobiliteit && (
                                  <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '60px 110px 90px', gap: 6, marginBottom: 8 }}>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Sets</div>
                                        <input type="number" value={ex.sets||3} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'sets', e.target.value)} style={{...exInp, textAlign:'center'}} />
                                      </div>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Vasthoud (sec)</div>
                                        <input type="number" value={ex.hold_s||30} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'hold_s', e.target.value)} style={{...exInp, textAlign:'center'}} />
                                      </div>
                                      <div>
                                        <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Rust (s)</div>
                                        <input type="number" value={ex.rest||30} onChange={e => setExercise(selectedMeso, sIdx, eIdx, 'rest', e.target.value)} style={{...exInp, textAlign:'center'}} />
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      {['statisch', 'dynamisch'].map(t => (
                                        <button key={t} onClick={() => setExercise(selectedMeso, sIdx, eIdx, 'hold_type', t)}
                                          style={{ flex: 1, padding: '5px', background: (ex.hold_type||'statisch') === t ? '#a78bfa' : 'var(--dark3)', color: (ex.hold_type||'statisch') === t ? '#000' : 'var(--muted)', border: `1px solid ${(ex.hold_type||'statisch') === t ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, fontWeight: (ex.hold_type||'statisch') === t ? 700 : 400, textTransform: 'uppercase', letterSpacing: 1 }}>
                                          {t}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <button onClick={() => addExercise(selectedMeso, sIdx)} style={{ background: 'none', border: '1px dashed var(--muted2)', color: 'var(--muted)', ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '7px', cursor: 'pointer', width: '100%' }}>
                        + Oefening
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setStep(2)} style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 24px', background: 'none', cursor: 'pointer' }}>← Terug</button>
              <button onClick={saveSessions} disabled={loading} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 32px', border: 'none', cursor: 'pointer' }}>
                {loading ? 'OPSLAAN...' : '✓ PLAN OPSLAAN'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
