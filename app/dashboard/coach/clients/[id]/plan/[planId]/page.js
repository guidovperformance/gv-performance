'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Design tokens ──────────────────────────────────────────────────────────
const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
const SESSION_TYPES = ['kracht', 'conditie', 'gecombineerd', 'mobiliteit', 'herstel']
const TYPE_COLORS = { kracht:'#4ade80', conditie:'#38e8e8', gecombineerd:'#fb923c', mobiliteit:'#a78bfa', herstel:'#60a5fa' }
const INTENSITY = { low:'Laag', medium:'Gemiddeld', high:'Hoog', deload:'Deload' }
const INTENSITY_COLORS = { low:'#4ade80', medium:'#fb923c', high:'#f87171', deload:'#60a5fa' }

// ── Hardlopen helpers ───────────────────────────────────────────────────────
function calcSpeed(tempo) {
  if (!tempo || !String(tempo).includes(':')) return null
  const [m, s] = String(tempo).split(':')
  const min = parseInt(m) + parseInt(s || 0) / 60
  return min > 0 ? (60 / min).toFixed(1) : null
}

function parseExNotes(notes) {
  if (!notes || !notes.startsWith('{')) return null
  try { return JSON.parse(notes) } catch { return null }
}

function exSummary(ex) {
  const d = parseExNotes(ex.notes)
  if (d?._mode === 'conditie') {
    const spd = d.speed_kmh ? ` (${d.speed_kmh} km/h)` : ''
    return `${ex.sets}× ${d.distance_m || '—'}m @ ${d.tempo || '—'}/km${spd} | Rust ${d.rest_s || '—'}s`
  }
  if (d?._mode === 'mobiliteit') {
    return `${ex.sets}× ${d.hold_s || '—'}s ${d.hold_type || 'statisch'} | Rust ${d.rest_s || '—'}s`
  }
  return `${ex.sets}×${ex.reps || '—'}${ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}`
}

// ── Input stijlen ───────────────────────────────────────────────────────────
const baseInp = {
  background: 'var(--dark4)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--text)',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 13,
  padding: '8px 10px',
  outline: 'none',
  colorScheme: 'dark',
}
const lbl = { fontFamily: 'var(--font-barlow), sans-serif', fontSize: 9, letterSpacing: 2, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 4 }

// ── Hoofd component ─────────────────────────────────────────────────────────
export default function PlanView({ params }) {
  const { id: clientId, planId } = React.use(params)

  const [plan, setPlan]       = React.useState(null)
  const [mesos, setMesos]     = React.useState([])
  const [weekIdx, setWeekIdx] = React.useState(0)
  const [sessions, setSessions]     = React.useState([])
  const [allExercises, setAllExercises] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving]   = React.useState(null) // session id dat opslaat
  const [deleting, setDeleting] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    if (planId) { loadPlan(); loadExLib() }
  }, [planId])

  const loadPlan = async () => {
    setLoading(true)
    const { data: p } = await supabase.from('macro_plans').select('*').eq('id', planId).single()
    setPlan(p)
    const { data: m } = await supabase.from('meso_cycles').select('*').eq('macro_plan_id', planId).order('week_number')
    setMesos(m || [])
    if (m?.length > 0) await loadWeek(m[0].id)
    setLoading(false)
  }

  const loadExLib = async () => {
    const { data } = await supabase.from('exercises').select('id, name').order('name')
    setAllExercises(data || [])
  }

  const loadWeek = async (mesoId) => {
    const { data } = await supabase.from('training_sessions')
      .select('*, session_exercises(*, exercises(*))')
      .eq('meso_cycle_id', mesoId)
      .order('day_of_week')
    setSessions(data || [])
  }

  const selectWeek = async (idx) => {
    setWeekIdx(idx)
    if (mesos[idx]) await loadWeek(mesos[idx].id)
  }

  // ── Sessie acties ──────────────────────────────────────────────────────────
  const updateSession = (id, field, val) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  const saveSession = async (s) => {
    setSaving(s.id)
    await supabase.from('training_sessions').update({
      session_name: s.session_name,
      session_type: s.session_type,
      day_of_week:  parseInt(s.day_of_week) || 1,
    }).eq('id', s.id)
    setSaving(null)
  }

  const addSession = async () => {
    const mesoId = mesos[weekIdx]?.id
    if (!mesoId) return
    await supabase.from('training_sessions').insert({
      meso_cycle_id: mesoId, client_id: clientId,
      session_name: 'Nieuwe training', session_type: 'kracht', day_of_week: 1,
    })
    await loadWeek(mesoId)
  }

  const deleteSession = async (sessionId) => {
    if (!confirm('Training verwijderen? Oefeningen gaan ook weg.')) return
    await supabase.from('session_exercises').delete().eq('session_id', sessionId)
    await supabase.from('training_sessions').delete().eq('id', sessionId)
    await loadWeek(mesos[weekIdx].id)
  }

  // ── Oefening acties ────────────────────────────────────────────────────────
  const updateExercise = (sessionId, exId, field, val) => {
    setSessions(prev => prev.map(s => s.id !== sessionId ? s : {
      ...s,
      session_exercises: s.session_exercises.map(e => e.id !== exId ? e : { ...e, [field]: val })
    }))
  }

  const saveExercise = async (ex, sessionType) => {
    const mode = ex._mode || (sessionType === 'conditie' ? 'conditie' : sessionType === 'mobiliteit' ? 'mobiliteit' : 'kracht')
    let reps = null, weight_kg = null, notes = null

    if (mode === 'conditie') {
      const speed = calcSpeed(ex._tempo)
      notes = JSON.stringify({ _mode:'conditie', distance_m:parseInt(ex._distance)||null, rest_s:parseInt(ex.rest_seconds)||180, tempo:ex._tempo||null, speed_kmh:speed?parseFloat(speed):null })
    } else if (mode === 'mobiliteit') {
      notes = JSON.stringify({ _mode:'mobiliteit', hold_s:parseInt(ex._hold_s)||30, hold_type:ex._hold_type||'statisch', rest_s:parseInt(ex.rest_seconds)||30 })
    } else {
      reps = ex.reps || '8-10'
      weight_kg = ex.weight_kg ? parseFloat(ex.weight_kg) : null
      notes = ex._notes || null
    }

    await supabase.from('session_exercises').update({
      sets: parseInt(ex.sets) || 3, reps, weight_kg,
      rest_seconds: parseInt(ex.rest_seconds) || 90, notes,
    }).eq('id', ex.id)
  }

  const addExercise = async (session) => {
    const exId = allExercises[0]?.id
    if (!exId) { alert('Voeg eerst oefeningen toe aan de bibliotheek'); return }
    const isConditie = session.session_type === 'conditie'
    const isMob = session.session_type === 'mobiliteit'
    let notes = null
    if (isConditie) notes = JSON.stringify({ _mode:'conditie', distance_m:400, rest_s:180, tempo:'5:00', speed_kmh:12.0 })
    if (isMob)     notes = JSON.stringify({ _mode:'mobiliteit', hold_s:30, hold_type:'statisch', rest_s:30 })
    await supabase.from('session_exercises').insert({
      session_id: session.id, exercise_id: exId,
      sets: isConditie ? 4 : 3,
      reps: isConditie || isMob ? null : '8-10',
      rest_seconds: isConditie ? 180 : isMob ? 30 : 90,
      notes,
      order_index: session.session_exercises?.length || 0,
    })
    await loadWeek(mesos[weekIdx].id)
  }

  const deleteExercise = async (exId, sessionId) => {
    await supabase.from('session_exercises').delete().eq('id', exId)
    setSessions(prev => prev.map(s => s.id !== sessionId ? s : {
      ...s, session_exercises: s.session_exercises.filter(e => e.id !== exId)
    }))
  }

  // ── Verwijder HEEL het plan ─────────────────────────────────────────────────
  const deletePlan = async () => {
    if (!confirm('Weet je zeker dat je het VOLLEDIGE trainingsplan wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return
    if (!confirm('Laatste kans: alle weken, trainingen en oefeningen worden definitief verwijderd.')) return
    setDeleting(true)
    // Cascade delete
    for (const meso of mesos) {
      const { data: sessList } = await supabase.from('training_sessions').select('id').eq('meso_cycle_id', meso.id)
      for (const sess of sessList || []) {
        await supabase.from('exercise_logs').delete().eq('session_exercise_id', sess.id)
        await supabase.from('session_exercises').delete().eq('session_id', sess.id)
        await supabase.from('session_logs').delete().eq('session_id', sess.id)
      }
      await supabase.from('training_sessions').delete().eq('meso_cycle_id', meso.id)
      await supabase.from('meso_cycles').delete().eq('id', meso.id)
    }
    await supabase.from('macro_plans').delete().eq('id', planId)
    router.push(`/dashboard/coach/clients/${clientId}`)
  }

  // ── Laad-scherm ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', ...D, fontSize:22, color:'var(--orange)', letterSpacing:3 }}>
      LADEN...
    </div>
  )

  return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', ...B }}>

      {/* Header */}
      <header style={{ background:'var(--dark2)', borderBottom:'1px solid rgba(255,77,0,0.12)', padding:'14px 40px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
          </svg>
          <span style={{ ...D, fontSize:16, letterSpacing:3, fontWeight:700, color:'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <a href={`/dashboard/coach/clients/${clientId}`} style={{ ...B, fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', textDecoration:'none' }}>← Klant</a>
          <button onClick={deletePlan} disabled={deleting}
            style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', ...B, fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'7px 14px', cursor:'pointer' }}>
            {deleting ? 'Verwijderen...' : '🗑 Verwijder plan'}
          </button>
        </div>
      </header>

      <main style={{ padding:'clamp(16px,4vw,40px)' }}>

        {/* Plan info */}
        <div style={{ marginBottom:24 }}>
          <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:6 }}>Trainingsplan wijzigen</div>
          <h1 style={{ ...D, fontSize:'clamp(24px,4vw,40px)', fontWeight:700, letterSpacing:2, marginBottom:6 }}>{plan?.name?.toUpperCase()}</h1>
          {plan?.goal && <div style={{ ...B, fontSize:14, color:'var(--muted)' }}>🎯 {plan.goal}</div>}
        </div>

        {/* Week tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:4, flexWrap:'wrap' }}>
          {mesos.map((m,i) => (
            <button key={m.id} onClick={() => selectWeek(i)}
              style={{ background:weekIdx===i ? 'var(--orange)' : 'var(--dark2)', color:weekIdx===i ? '#000' : 'var(--muted)', ...B, fontWeight:weekIdx===i ? 700 : 400, fontSize:12, letterSpacing:1, padding:'8px 16px', border:'none', cursor:'pointer' }}>
              W{m.week_number} — {m.focus || m.intensity}
            </button>
          ))}
        </div>

        {/* Week balk */}
        {mesos[weekIdx] && (
          <div style={{ background:'var(--dark2)', padding:'12px 20px', marginBottom:20, display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <div style={{ ...B, fontSize:9, letterSpacing:2, color:'var(--muted)', textTransform:'uppercase', marginBottom:2 }}>Intensiteit</div>
              <div style={{ ...D, fontSize:14, fontWeight:700, color:INTENSITY_COLORS[mesos[weekIdx].intensity] || 'var(--orange)' }}>
                {INTENSITY[mesos[weekIdx].intensity] || mesos[weekIdx].intensity}
              </div>
            </div>
            <button onClick={addSession}
              style={{ marginLeft:'auto', background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', padding:'8px 20px', border:'none', cursor:'pointer' }}>
              + Dag toevoegen
            </button>
          </div>
        )}

        {/* Sessies — exact zelfde format als de builder */}
        {sessions.length === 0 ? (
          <div style={{ background:'var(--dark2)', padding:48, textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📅</div>
            <div style={{ ...D, fontSize:18, fontWeight:700, marginBottom:8 }}>Geen trainingen in week {weekIdx+1}</div>
            <button onClick={addSession}
              style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', padding:'12px 28px', border:'none', cursor:'pointer', marginTop:12 }}>
              + Dag toevoegen
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {sessions.map(session => {
              const typeColor = TYPE_COLORS[session.session_type] || 'var(--orange)'
              const isGecomb = session.session_type === 'gecombineerd'
              return (
                <div key={session.id} style={{ background:'var(--dark2)', padding:24, border:'1px solid rgba(255,255,255,0.05)' }}>

                  {/* Sessie header — altijd bewerkbaar, zelfde als builder */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 180px 160px 40px', gap:12, marginBottom:20, alignItems:'end' }}>
                    <div>
                      <label style={lbl}>Naam training</label>
                      <input value={session.session_name || ''}
                        onChange={e => updateSession(session.id, 'session_name', e.target.value)}
                        onBlur={() => saveSession(session)}
                        style={{ ...baseInp, width:'100%', fontSize:15, fontWeight:600 }}
                        placeholder="Bijv. Kracht Boven, Looptraining..." />
                    </div>
                    <div>
                      <label style={lbl}>Type</label>
                      <select value={session.session_type}
                        onChange={e => { updateSession(session.id, 'session_type', e.target.value); setTimeout(() => saveSession({...session, session_type: e.target.value}), 100) }}
                        style={{ ...baseInp, width:'100%' }}>
                        {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Dag</label>
                      <select value={session.day_of_week || 1}
                        onChange={e => { updateSession(session.id, 'day_of_week', e.target.value); setTimeout(() => saveSession({...session, day_of_week: e.target.value}), 100) }}
                        style={{ ...baseInp, width:'100%' }}>
                        {DAYS.map((d,i) => <option key={i+1} value={i+1}>{d}</option>)}
                      </select>
                    </div>
                    <button onClick={() => deleteSession(session.id)}
                      style={{ background:'none', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', cursor:'pointer', padding:'8px', fontSize:16, height:38 }}>
                      ✕
                    </button>
                  </div>

                  {/* Oefeningen */}
                  <div style={{ ...B, fontSize:10, letterSpacing:3, color:'var(--orange)', textTransform:'uppercase', marginBottom:12 }}>Oefeningen</div>

                  {session.session_exercises?.map((ex, eIdx) => {
                    const data = parseExNotes(ex.notes)
                    const mode = ex._mode || data?._mode || (session.session_type === 'conditie' ? 'conditie' : session.session_type === 'mobiliteit' ? 'mobiliteit' : 'kracht')
                    const isConditie = mode === 'conditie'
                    const isMob = mode === 'mobiliteit'
                    const tempo = ex._tempo || data?.tempo || ''
                    const speed = calcSpeed(tempo)

                    return (
                      <div key={ex.id} style={{ background:'var(--dark3)', padding:'14px 16px', marginBottom:8, borderLeft:`2px solid ${TYPE_COLORS[mode] || typeColor}` }}>
                        {/* Oefening naam + mode toggle (gecombineerd) */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 28px', gap:8, marginBottom:10 }}>
                          <select value={ex.exercise_id}
                            onChange={async e => {
                              const found = allExercises.find(x => x.id === e.target.value)
                              updateExercise(session.id, ex.id, 'exercise_id', e.target.value)
                              updateExercise(session.id, ex.id, 'exercises', found)
                              await supabase.from('session_exercises').update({ exercise_id: e.target.value }).eq('id', ex.id)
                            }}
                            style={{ ...baseInp, width:'100%', fontWeight:600, fontSize:14 }}>
                            {allExercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                          <button onClick={() => deleteExercise(ex.id, session.id)}
                            style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:16, padding:0 }}>✕</button>
                        </div>

                        {/* Mode toggle voor gecombineerd */}
                        {isGecomb && (
                          <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                            {['kracht','conditie','mobiliteit'].map(m => (
                              <button key={m}
                                onClick={() => updateExercise(session.id, ex.id, '_mode', m)}
                                style={{ flex:1, padding:'4px', background:mode===m ? TYPE_COLORS[m] : 'var(--dark4)', color:mode===m ? '#000':'var(--muted)', border:`1px solid ${mode===m ? TYPE_COLORS[m] : 'rgba(255,255,255,0.08)'}`, cursor:'pointer', ...B, fontSize:10, fontWeight:mode===m?700:400, textTransform:'uppercase', letterSpacing:1 }}>
                                {m}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* KRACHT */}
                        {!isConditie && !isMob && (
                          <div style={{ display:'grid', gridTemplateColumns:'60px 80px 80px 80px 1fr', gap:8 }}>
                            {[['Sets','number','sets','3'],['Reps','text','reps','8-10'],['KG','number','weight_kg','—'],['Rust(s)','number','rest_seconds','90']].map(([h,t,f,ph]) => (
                              <div key={f}>
                                <label style={lbl}>{h}</label>
                                <input type={t} placeholder={ph} value={ex[f]||''} step={f==='weight_kg'?'0.5':undefined}
                                  onChange={e => updateExercise(session.id, ex.id, f, e.target.value)}
                                  onBlur={() => saveExercise({...ex, _mode:'kracht'}, session.session_type)}
                                  style={{ ...baseInp, width:'100%', textAlign:f==='weight_kg'||f==='sets'||f==='rest_seconds'?'center':'left' }} />
                              </div>
                            ))}
                            <div>
                              <label style={lbl}>Notities</label>
                              <input placeholder="Bijv. RIR 2..." value={ex._notes || (data?._mode ? '' : (ex.notes||''))}
                                onChange={e => updateExercise(session.id, ex.id, '_notes', e.target.value)}
                                onBlur={() => saveExercise(ex, session.session_type)}
                                style={{ ...baseInp, width:'100%' }} />
                            </div>
                          </div>
                        )}

                        {/* CONDITIE */}
                        {isConditie && (
                          <div>
                            <div style={{ display:'grid', gridTemplateColumns:'60px 100px 120px 90px', gap:8, marginBottom:8 }}>
                              <div>
                                <label style={lbl}>Intervals</label>
                                <input type="number" value={ex.sets||4} onChange={e => updateExercise(session.id, ex.id, 'sets', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'conditie', _distance:data?.distance_m||'', _tempo:tempo}, session.session_type)} style={{ ...baseInp, width:'100%', textAlign:'center' }} />
                              </div>
                              <div>
                                <label style={lbl}>Afstand (m)</label>
                                <input type="number" value={ex._distance ?? (data?.distance_m||'')} onChange={e => updateExercise(session.id, ex.id, '_distance', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'conditie'}, session.session_type)} style={{ ...baseInp, width:'100%', textAlign:'center' }} placeholder="400" />
                              </div>
                              <div>
                                <label style={lbl}>Tempo (min:sec/km)</label>
                                <input value={tempo} onChange={e => updateExercise(session.id, ex.id, '_tempo', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'conditie'}, session.session_type)} style={{ ...baseInp, width:'100%' }} placeholder="5:30" />
                              </div>
                              <div>
                                <label style={lbl}>Rust (s)</label>
                                <input type="number" value={ex.rest_seconds || data?.rest_s || 180} onChange={e => updateExercise(session.id, ex.id, 'rest_seconds', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'conditie'}, session.session_type)} style={{ ...baseInp, width:'100%', textAlign:'center' }} />
                              </div>
                            </div>
                            {speed && (
                              <div style={{ background:'rgba(56,232,232,0.08)', border:'1px solid rgba(56,232,232,0.2)', padding:'6px 12px', display:'flex', gap:16 }}>
                                <span style={{ ...B, fontSize:12, color:'#38e8e8' }}>⚡ <strong>{speed} km/h</strong></span>
                                <span style={{ ...B, fontSize:11, color:'#888' }}>{tempo} min/km</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* MOBILITEIT */}
                        {isMob && (
                          <div>
                            <div style={{ display:'grid', gridTemplateColumns:'60px 120px 90px', gap:8, marginBottom:8 }}>
                              <div>
                                <label style={lbl}>Sets</label>
                                <input type="number" value={ex.sets||3} onChange={e => updateExercise(session.id, ex.id, 'sets', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'mobiliteit', _hold_s:data?.hold_s||30, _hold_type:data?.hold_type||'statisch'}, session.session_type)} style={{ ...baseInp, width:'100%', textAlign:'center' }} />
                              </div>
                              <div>
                                <label style={lbl}>Vasthoud (sec)</label>
                                <input type="number" value={ex._hold_s ?? (data?.hold_s||30)} onChange={e => updateExercise(session.id, ex.id, '_hold_s', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'mobiliteit'}, session.session_type)} style={{ ...baseInp, width:'100%', textAlign:'center' }} />
                              </div>
                              <div>
                                <label style={lbl}>Rust (s)</label>
                                <input type="number" value={ex.rest_seconds || data?.rest_s || 30} onChange={e => updateExercise(session.id, ex.id, 'rest_seconds', e.target.value)} onBlur={() => saveExercise({...ex, _mode:'mobiliteit'}, session.session_type)} style={{ ...baseInp, width:'100%', textAlign:'center' }} />
                              </div>
                            </div>
                            <div style={{ display:'flex', gap:4 }}>
                              {['statisch','dynamisch'].map(t => {
                                const cur = ex._hold_type ?? (data?.hold_type || 'statisch')
                                return (
                                  <button key={t}
                                    onClick={() => { updateExercise(session.id, ex.id, '_hold_type', t); saveExercise({...ex, _mode:'mobiliteit', _hold_type:t}, session.session_type) }}
                                    style={{ flex:1, padding:'5px', background:cur===t?'#a78bfa':'var(--dark4)', color:cur===t?'#000':'var(--muted)', border:`1px solid ${cur===t?'#a78bfa':'rgba(255,255,255,0.08)'}`, cursor:'pointer', ...B, fontSize:10, fontWeight:cur===t?700:400, textTransform:'uppercase', letterSpacing:1 }}>
                                    {t}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button onClick={() => addExercise(session)}
                    style={{ background:'none', border:'1px dashed var(--muted2)', color:'var(--muted)', ...B, fontSize:11, letterSpacing:2, textTransform:'uppercase', padding:'8px', cursor:'pointer', width:'100%', marginTop:4 }}>
                    + Oefening
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
