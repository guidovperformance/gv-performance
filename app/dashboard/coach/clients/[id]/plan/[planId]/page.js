'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const INTENSITY_COLORS = { low:'#4ade80', medium:'#fb923c', high:'#f87171', deload:'#60a5fa' }
const INTENSITY_LABELS = { low:'Laag', medium:'Gemiddeld', high:'Hoog', deload:'Deload' }
const DAYS = ['Ma','Di','Wo','Do','Vr','Za','Zo']
const SESSION_TYPES = ['kracht','conditie','gecombineerd','mobiliteit','herstel']
const TYPE_COLORS = { kracht:'#4ade80', conditie:'#38e8e8', gecombineerd:'#fb923c', mobiliteit:'#a78bfa', herstel:'#60a5fa' }

// ── Hulpfuncties voor tempo/snelheid ─────────────────────────────────────────
function parseTempoToMin(tempo) {
  if (!tempo) return null
  const str = String(tempo).replace(',','.')
  if (str.includes(':')) {
    const [m, s] = str.split(':')
    return parseInt(m) + parseInt(s || 0) / 60
  }
  return parseFloat(str) || null
}

function calcSpeed(tempo) {
  const min = parseTempoToMin(tempo)
  if (!min || min <= 0) return null
  return (60 / min).toFixed(1)
}

// Leest JSON uit notes veld (opgeslagen door conditie/mobiliteit oefeningen)
function parseExNotes(notes) {
  if (!notes || !notes.startsWith('{')) return null
  try { return JSON.parse(notes) } catch { return null }
}

// Geeft display-tekst voor een oefening op basis van type
function exDisplayText(ex) {
  const data = parseExNotes(ex.notes)
  if (data?._mode === 'conditie') {
    const speed = data.speed_kmh ? ` (${data.speed_kmh} km/h)` : ''
    const tempo = data.tempo ? ` @ ${data.tempo}/km${speed}` : ''
    const dist  = data.distance_m ? `${data.distance_m}m` : '—'
    const rust  = data.rest_s ? ` | Rust: ${Math.floor(data.rest_s/60)}:${String(data.rest_s%60).padStart(2,'0')}` : ''
    return `${ex.sets}× ${dist}${tempo}${rust}`
  }
  if (data?._mode === 'mobiliteit') {
    const hold = data.hold_s ? `${data.hold_s}s` : '—'
    const type = data.hold_type ? ` (${data.hold_type})` : ''
    const rust = data.rest_s ? ` | Rust: ${data.rest_s}s` : ''
    return `${ex.sets}× ${hold} vasthoud${type}${rust}`
  }
  return `${ex.sets}×${ex.reps || '—'}${ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}`
}

// Bepaal oefening-mode op basis van session type of opgeslagen notes
function getExMode(ex, sessionType) {
  const data = parseExNotes(ex?.notes)
  if (data?._mode) return data._mode
  if (sessionType === 'conditie') return 'conditie'
  if (sessionType === 'mobiliteit') return 'mobiliteit'
  return 'kracht'
}

export default function PlanView({ params }) {
  // FIXED: React.use() buiten useEffect - correct voor Next.js 15
  const { id: clientIdParam, planId: planIdParam } = React.use(params)

  const [plan, setPlan]             = React.useState(null)
  const [mesos, setMesos]           = React.useState([])
  const [selectedWeek, setSelectedWeek] = React.useState(0)
  const [sessions, setSessions]     = React.useState([])
  const [loading, setLoading]       = React.useState(true)
  const [editingExercise, setEditingExercise] = React.useState(null)
  const [editingSession, setEditingSession]   = React.useState(null)
  const [saving, setSaving]         = React.useState(false)
  const [allExercises, setAllExercises] = React.useState([])
  const clientId  = clientIdParam
  const planIdVal = planIdParam
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    if (!planIdVal) return
    loadPlan(planIdVal)
    loadExercises()
  }, [planIdVal])

  const loadExercises = async () => {
    const { data } = await supabase.from('exercises').select('id, name, category').order('name')
    setAllExercises(data || [])
  }

  const loadPlan = async (pid) => {
    setLoading(true)
    const { data: planData } = await supabase.from('macro_plans').select('*').eq('id', pid).single()
    setPlan(planData)
    const { data: mesoData } = await supabase.from('meso_cycles').select('*').eq('macro_plan_id', pid).order('week_number')
    setMesos(mesoData || [])
    if (mesoData?.length > 0) await loadSessions(mesoData[0].id)
    setLoading(false)
  }

  const loadSessions = async (mesoId) => {
    const { data } = await supabase.from('training_sessions')
      .select('*, session_exercises(*, exercises(*))')
      .eq('meso_cycle_id', mesoId).order('day_of_week')
    setSessions(data || [])
  }

  const selectWeek = async (idx) => {
    setSelectedWeek(idx)
    if (mesos[idx]) await loadSessions(mesos[idx].id)
  }

  // ── SESSIE opslaan (naam, type, dag) ─────────────────────────────────────
  const saveSession = async (sess) => {
    setSaving(true)
    await supabase.from('training_sessions').update({
      session_name: sess.session_name,
      session_type: sess.session_type,
      day_of_week:  parseInt(sess.day_of_week) || 1,
      session_date: sess.session_date || null,
    }).eq('id', sess.id)
    setSaving(false)
    setEditingSession(null)
    await loadSessions(mesos[selectedWeek].id)
  }

  // ── OEFENING opslaan (type-specifiek) ────────────────────────────────────
  const saveExercise = async (ex) => {
    setSaving(true)
    const mode = ex._mode || 'kracht'
    let notes = null
    let sets = parseInt(ex.sets) || 3
    let reps = null
    let weight_kg = null
    let rest_seconds = parseInt(ex.rest_seconds) || 90

    if (mode === 'conditie') {
      const speed = calcSpeed(ex._tempo)
      notes = JSON.stringify({
        _mode: 'conditie',
        distance_m: parseInt(ex._distance) || null,
        rest_s: rest_seconds,
        tempo: ex._tempo || null,
        speed_kmh: speed ? parseFloat(speed) : null,
      })
    } else if (mode === 'mobiliteit') {
      notes = JSON.stringify({
        _mode: 'mobiliteit',
        hold_s: parseInt(ex._hold_s) || 30,
        hold_type: ex._hold_type || 'statisch',
        rest_s: rest_seconds,
      })
    } else {
      // kracht
      reps = ex.reps || '8-10'
      weight_kg = ex.weight_kg ? parseFloat(ex.weight_kg) : null
      notes = ex.notes || null
    }

    await supabase.from('session_exercises').update({
      exercise_id: ex.exercise_id,
      sets, reps, weight_kg, rest_seconds, notes,
    }).eq('id', ex.id)

    setSaving(false)
    setEditingExercise(null)
    await loadSessions(mesos[selectedWeek].id)
  }

  const deleteExercise = async (exId) => {
    await supabase.from('session_exercises').delete().eq('id', exId)
    await loadSessions(mesos[selectedWeek].id)
  }

  const addSession = async (mesoId) => {
    await supabase.from('training_sessions').insert({
      meso_cycle_id: mesoId, client_id: clientId,
      session_name: 'Nieuwe training', session_type: 'kracht', day_of_week: 1,
    })
    await loadSessions(mesoId)
  }

  const deleteSession = async (sessionId) => {
    if (!confirm('Training verwijderen?')) return
    await supabase.from('session_exercises').delete().eq('session_id', sessionId)
    await supabase.from('training_sessions').delete().eq('id', sessionId)
    await loadSessions(mesos[selectedWeek].id)
  }

  const addExercise = async (sessionId, sessionType) => {
    let exId = allExercises[0]?.id
    if (!exId) {
      const { data } = await supabase.from('exercises').insert({ name: 'Oefening', category: 'kracht' }).select().single()
      exId = data?.id
    }
    if (!exId) return

    // Type-specifieke defaults
    let defNotes = null
    let defReps = '8-10'
    let defSets = 3
    let defRest = 90

    if (sessionType === 'conditie') {
      defNotes = JSON.stringify({ _mode:'conditie', distance_m:400, rest_s:180, tempo:'5:00', speed_kmh:12.0 })
      defReps = null
      defRest = 180
      defSets = 4
    } else if (sessionType === 'mobiliteit') {
      defNotes = JSON.stringify({ _mode:'mobiliteit', hold_s:30, hold_type:'statisch', rest_s:30 })
      defReps = null
      defRest = 30
    }

    await supabase.from('session_exercises').insert({
      session_id: sessionId, exercise_id: exId,
      order_index: sessions.find(s => s.id === sessionId)?.session_exercises?.length || 0,
      sets: defSets, reps: defReps, rest_seconds: defRest, notes: defNotes,
    })
    await loadSessions(mesos[selectedWeek].id)
  }

  // ── Initieer editingExercise met mode-specifieke velden ───────────────────
  const startEditExercise = (ex, sessionType) => {
    const data = parseExNotes(ex.notes)
    const mode = data?._mode || (sessionType === 'conditie' ? 'conditie' : sessionType === 'mobiliteit' ? 'mobiliteit' : 'kracht')
    setEditingExercise({
      ...ex,
      _mode: mode,
      _distance: data?.distance_m ? String(data.distance_m) : '',
      _tempo:    data?.tempo || '',
      _hold_s:   data?.hold_s ? String(data.hold_s) : '30',
      _hold_type: data?.hold_type || 'statisch',
    })
  }

  const inp = { background:'var(--dark4)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--text)', fontFamily:'var(--font-barlow), sans-serif', fontSize:13, padding:'6px 8px', outline:'none', width:'100%', colorScheme:'dark' }

  if (loading) return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', ...D, fontSize:24, color:'var(--orange)' }}>LADEN...</div>
  )

  return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', ...B }}>
      <header style={{ background:'var(--dark2)', borderBottom:'1px solid rgba(255,77,0,0.12)', padding:'16px 40px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
          </svg>
          <span style={{ ...D, fontSize:18, letterSpacing:3, fontWeight:700 }}>GV PERFORMANCE</span>
        </div>
        <a href={`/dashboard/coach/clients/${clientIdParam}`} style={{ ...B, fontSize:12, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', textDecoration:'none' }}>← Klant</a>
      </header>

      <main style={{ padding:'clamp(16px,4vw,40px)' }}>

        {/* Plan header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:6 }}>Trainingsplan</div>
          <h1 style={{ ...D, fontSize:'clamp(24px,4vw,36px)', fontWeight:700, letterSpacing:1, marginBottom:8 }}>{plan?.name}</h1>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {plan?.goal && <span style={{ ...B, fontSize:14, color:'var(--muted)' }}>🎯 {plan.goal}</span>}
            <span style={{ ...B, fontSize:14, color:'var(--muted)' }}>📋 {mesos.length} weken</span>
          </div>
        </div>

        {/* Week tabs */}
        <div style={{ display:'flex', gap:2, marginBottom:16, flexWrap:'wrap' }}>
          {mesos.map((m,i) => (
            <button key={m.id} onClick={() => selectWeek(i)}
              style={{ background:selectedWeek===i ? 'var(--orange)' : 'var(--dark2)', color:selectedWeek===i ? '#000' : 'var(--muted)', ...B, fontWeight:selectedWeek===i ? 700 : 400, fontSize:12, letterSpacing:1, padding:'8px 14px', border:'none', cursor:'pointer' }}>
              W{m.week_number}
            </button>
          ))}
        </div>

        {/* Week info + + Training knop */}
        {mesos[selectedWeek] && (
          <div style={{ background:'var(--dark2)', padding:'14px 20px', marginBottom:16, display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <div style={{ ...B, fontSize:9, letterSpacing:2, color:'var(--muted)', textTransform:'uppercase', marginBottom:2 }}>Intensiteit</div>
              <div style={{ ...D, fontSize:15, fontWeight:700, color:INTENSITY_COLORS[mesos[selectedWeek].intensity]||'var(--orange)' }}>
                {INTENSITY_LABELS[mesos[selectedWeek].intensity]||mesos[selectedWeek].intensity}
              </div>
            </div>
            <button onClick={() => addSession(mesos[selectedWeek].id)}
              style={{ marginLeft:'auto', background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', padding:'8px 16px', border:'none', cursor:'pointer' }}>
              + Training toevoegen
            </button>
          </div>
        )}

        {/* Sessions */}
        {sessions.length === 0 ? (
          <div style={{ background:'var(--dark2)', padding:48, textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🏋️</div>
            <div style={{ ...D, fontSize:18, fontWeight:700, marginBottom:8 }}>Geen trainingen deze week</div>
            <button onClick={() => addSession(mesos[selectedWeek]?.id)}
              style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', padding:'12px 24px', border:'none', cursor:'pointer', marginTop:12 }}>
              + Training toevoegen
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:12 }}>
            {sessions.map(session => {
              const typeColor = TYPE_COLORS[session.session_type] || 'var(--orange)'
              return (
                <div key={session.id} style={{ background:'var(--dark2)', padding:20, borderTop:`3px solid ${typeColor}` }}>

                  {/* Session header — klikbaar om te bewerken */}
                  {editingSession?.id === session.id ? (
                    <div style={{ marginBottom:14, display:'flex', flexDirection:'column', gap:8 }}>
                      <input value={editingSession.session_name}
                        onChange={e => setEditingSession(p => ({...p, session_name:e.target.value}))}
                        style={{ ...inp, fontSize:15, fontWeight:700 }} placeholder="Naam training" />
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <select value={editingSession.session_type}
                          onChange={e => setEditingSession(p => ({...p, session_type:e.target.value}))}
                          style={inp}>
                          {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={editingSession.day_of_week || 1}
                          onChange={e => setEditingSession(p => ({...p, day_of_week:e.target.value}))}
                          style={inp}>
                          {DAYS.map((d,i) => <option key={i+1} value={i+1}>{d}</option>)}
                        </select>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => saveSession(editingSession)} disabled={saving}
                          style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:11, letterSpacing:1, padding:'6px 14px', border:'none', cursor:'pointer' }}>
                          {saving ? '...' : '✓ Opslaan'}
                        </button>
                        <button onClick={() => setEditingSession(null)}
                          style={{ background:'none', border:'1px solid var(--muted2)', color:'var(--muted)', ...B, fontSize:11, padding:'6px 10px', cursor:'pointer' }}>
                          Annuleer
                        </button>
                        <button onClick={() => deleteSession(session.id)}
                          style={{ background:'none', border:'1px solid rgba(255,107,107,0.3)', color:'#ff6b6b', ...B, fontSize:11, padding:'6px 10px', cursor:'pointer', marginLeft:'auto' }}>
                          Verwijder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                      <div>
                        <div style={{ ...B, fontSize:10, color:typeColor, letterSpacing:2, textTransform:'uppercase', marginBottom:3 }}>
                          {DAYS[(session.day_of_week||1)-1]} · {session.session_type}
                        </div>
                        <div style={{ ...D, fontSize:20, fontWeight:700, letterSpacing:1 }}>{session.session_name}</div>
                      </div>
                      <button onClick={() => setEditingSession({...session})}
                        style={{ background:'none', border:'1px solid var(--muted2)', color:'var(--muted)', ...B, fontSize:10, letterSpacing:1, padding:'4px 10px', cursor:'pointer', flexShrink:0 }}>
                        ✎ Wijzigen
                      </button>
                    </div>
                  )}

                  {/* Exercises */}
                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
                    {session.session_exercises?.map((ex, i) => (
                      <div key={ex.id}>
                        {editingExercise?.id === ex.id ? (
                          <ExerciseForm
                            ex={editingExercise}
                            sessionType={session.session_type}
                            allExercises={allExercises}
                            saving={saving}
                            inp={inp}
                            onChange={setEditingExercise}
                            onSave={() => saveExercise(editingExercise)}
                            onCancel={() => setEditingExercise(null)}
                            onDelete={() => deleteExercise(ex.id)}
                          />
                        ) : (
                          <div onClick={() => startEditExercise(ex, session.session_type)}
                            style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'var(--dark3)', cursor:'pointer' }}>
                            <span style={{ ...D, fontSize:12, color:typeColor, fontWeight:700, minWidth:18 }}>{i+1}</span>
                            <span style={{ ...B, fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.exercises?.name}</span>
                            <span style={{ ...B, fontSize:11, color:'var(--muted)', flexShrink:0 }}>{exDisplayText(ex)}</span>
                            <span style={{ fontSize:10, color:'var(--muted2)' }}>✎</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => addExercise(session.id, session.session_type)}
                    style={{ background:'none', border:'1px dashed var(--muted2)', color:'var(--muted)', ...B, fontSize:11, letterSpacing:2, textTransform:'uppercase', padding:'7px', cursor:'pointer', width:'100%' }}>
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

// ── TYPE-SPECIFIEK OEFENING FORMULIER ─────────────────────────────────────────
function ExerciseForm({ ex, sessionType, allExercises, saving, inp, onChange, onSave, onCancel, onDelete }) {
  const mode = ex._mode || 'kracht'
  const typeColor = TYPE_COLORS[sessionType] || 'var(--orange)'
  const isGecombineerd = sessionType === 'gecombineerd'

  const speed = mode === 'conditie' ? calcSpeed(ex._tempo) : null

  return (
    <div style={{ background:'var(--dark3)', padding:14, marginBottom:4 }}>

      {/* Oefening selectie */}
      <select value={ex.exercise_id}
        onChange={e => {
          const found = allExercises.find(x => x.id === e.target.value)
          onChange(p => ({...p, exercise_id:e.target.value, exercises:found}))
        }}
        style={{ ...inp, marginBottom:8, fontSize:14, fontWeight:700 }}>
        {allExercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>

      {/* Mode toggle bij gecombineerd */}
      {(isGecombineerd || ['kracht','conditie','mobiliteit'].includes(mode)) && isGecombineerd && (
        <div style={{ display:'flex', gap:4, marginBottom:10 }}>
          {['kracht','conditie','mobiliteit'].map(m => (
            <button key={m} onClick={() => onChange(p => ({...p, _mode:m}))}
              style={{ flex:1, padding:'5px', background:mode===m ? TYPE_COLORS[m] : 'var(--dark4)', color:mode===m ? '#000' : 'var(--muted)', border:`1px solid ${mode===m ? TYPE_COLORS[m] : 'rgba(255,255,255,0.08)'}`, cursor:'pointer', fontFamily:'var(--font-barlow), sans-serif', fontSize:11, fontWeight:mode===m ? 700 : 400, textTransform:'uppercase', letterSpacing:1 }}>
              {m}
            </button>
          ))}
        </div>
      )}

      {/* ── KRACHT VELDEN ── */}
      {mode === 'kracht' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'60px 80px 80px 80px', gap:6, marginBottom:8 }}>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Sets</label>
              <input type="number" value={ex.sets||3} onChange={e => onChange(p=>({...p,sets:e.target.value}))} style={inp} placeholder="3" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Reps</label>
              <input value={ex.reps||''} onChange={e => onChange(p=>({...p,reps:e.target.value}))} style={inp} placeholder="8-10" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>KG</label>
              <input type="number" step="0.5" value={ex.weight_kg||''} onChange={e => onChange(p=>({...p,weight_kg:e.target.value}))} style={inp} placeholder="—" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Rust (s)</label>
              <input type="number" value={ex.rest_seconds||90} onChange={e => onChange(p=>({...p,rest_seconds:e.target.value}))} style={inp} placeholder="90" />
            </div>
          </div>
          <input value={ex.notes||''} onChange={e => onChange(p=>({...p,notes:e.target.value}))} style={{...inp, marginBottom:8}} placeholder="Notities (bijv. RIR 2, explosief uitvoeren...)" />
        </>
      )}

      {/* ── CONDITIE VELDEN (hardlopen / roeien / etc.) ── */}
      {mode === 'conditie' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'60px 100px 120px 90px', gap:6, marginBottom:8 }}>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Sets</label>
              <input type="number" value={ex.sets||4} onChange={e => onChange(p=>({...p,sets:e.target.value}))} style={inp} placeholder="4" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Afstand (m)</label>
              <input type="number" value={ex._distance||''} onChange={e => onChange(p=>({...p,_distance:e.target.value}))} style={inp} placeholder="400" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Tempo (min:sec /km)</label>
              <input value={ex._tempo||''} onChange={e => onChange(p=>({...p,_tempo:e.target.value}))} style={inp} placeholder="5:30" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Rust (s)</label>
              <input type="number" value={ex.rest_seconds||180} onChange={e => onChange(p=>({...p,rest_seconds:e.target.value}))} style={inp} placeholder="180" />
            </div>
          </div>
          {/* Auto-berekende snelheid */}
          {speed && (
            <div style={{ background:'rgba(56,232,232,0.08)', border:'1px solid rgba(56,232,232,0.2)', padding:'8px 12px', marginBottom:8, display:'flex', gap:16 }}>
              <span style={{ fontFamily:'var(--font-barlow), sans-serif', fontSize:12, color:'#38e8e8' }}>⚡ Snelheid: <strong>{speed} km/h</strong></span>
              {ex._tempo && <span style={{ fontFamily:'var(--font-barlow), sans-serif', fontSize:12, color:'#888' }}>= {ex._tempo} min/km</span>}
            </div>
          )}
          <input value={ex.notes?.startsWith('{') ? '' : (ex.notes||'')} onChange={e => onChange(p=>({...p,notes:e.target.value}))} style={{...inp, marginBottom:8}} placeholder="Notities (bijv. 90% MAS, roeier, treadmill...)" />
        </>
      )}

      {/* ── MOBILITEIT VELDEN ── */}
      {mode === 'mobiliteit' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'60px 110px 90px', gap:6, marginBottom:8 }}>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Sets</label>
              <input type="number" value={ex.sets||3} onChange={e => onChange(p=>({...p,sets:e.target.value}))} style={inp} placeholder="3" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Vasthoud (sec)</label>
              <input type="number" value={ex._hold_s||30} onChange={e => onChange(p=>({...p,_hold_s:e.target.value}))} style={inp} placeholder="30" />
            </div>
            <div>
              <label style={{ ...{ fontFamily:'var(--font-barlow), sans-serif' }, fontSize:9, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:3 }}>Rust (s)</label>
              <input type="number" value={ex.rest_seconds||30} onChange={e => onChange(p=>({...p,rest_seconds:e.target.value}))} style={inp} placeholder="30" />
            </div>
          </div>
          {/* Statisch / Dynamisch toggle */}
          <div style={{ display:'flex', gap:4, marginBottom:8 }}>
            {['statisch','dynamisch'].map(t => (
              <button key={t} onClick={() => onChange(p=>({...p,_hold_type:t}))}
                style={{ flex:1, padding:'6px', background:ex._hold_type===t ? '#a78bfa' : 'var(--dark4)', color:ex._hold_type===t ? '#000' : 'var(--muted)', border:`1px solid ${ex._hold_type===t ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`, cursor:'pointer', fontFamily:'var(--font-barlow), sans-serif', fontSize:11, fontWeight:ex._hold_type===t ? 700 : 400, textTransform:'uppercase', letterSpacing:1 }}>
                {t}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Actie knoppen */}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onSave} disabled={saving}
          style={{ background:'var(--orange)', color:'#000', fontFamily:'var(--font-barlow), sans-serif', fontWeight:700, fontSize:11, letterSpacing:1, padding:'7px 16px', border:'none', cursor:'pointer' }}>
          {saving ? '...' : '✓ Opslaan'}
        </button>
        <button onClick={onCancel}
          style={{ background:'none', border:'1px solid var(--muted2)', color:'var(--muted)', fontFamily:'var(--font-barlow), sans-serif', fontSize:11, padding:'7px 12px', cursor:'pointer' }}>
          Annuleer
        </button>
        <button onClick={onDelete}
          style={{ background:'none', border:'1px solid rgba(255,107,107,0.3)', color:'#ff6b6b', fontFamily:'var(--font-barlow), sans-serif', fontSize:11, padding:'7px 12px', cursor:'pointer', marginLeft:'auto' }}>
          Verwijder
        </button>
      </div>
    </div>
  )
}
