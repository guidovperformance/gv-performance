'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const INTENSITY_COLORS = { low: '#4ade80', medium: '#fb923c', high: '#f87171', deload: '#60a5fa' }
const INTENSITY_LABELS = { low: 'Laag', medium: 'Gemiddeld', high: 'Hoog', deload: 'Deload' }
const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

export default function PlanView({ params }) {
  const [plan, setPlan] = React.useState(null)
  const [mesos, setMesos] = React.useState([])
  const [selectedWeek, setSelectedWeek] = React.useState(0)
  const [sessions, setSessions] = React.useState([])
  const [clientId, setClientId] = React.useState(null)
  const [planId, setPlanId] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [editingExercise, setEditingExercise] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [allExercises, setAllExercises] = React.useState([])
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    params.then(p => {
      setClientId(p.id)
      setPlanId(p.planId)
      loadPlan(p.planId)
      loadExercises()
    })
  }, [params])

  const loadExercises = async () => {
    const { data } = await supabase.from('exercises').select('id, name').order('name')
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
    const { data } = await supabase
      .from('training_sessions')
      .select('*, session_exercises(*, exercises(*))')
      .eq('meso_cycle_id', mesoId)
      .order('day_of_week')
    setSessions(data || [])
  }

  const selectWeek = async (idx) => {
    setSelectedWeek(idx)
    if (mesos[idx]) await loadSessions(mesos[idx].id)
  }

  const saveExercise = async (exercise) => {
    setSaving(true)
    await supabase.from('session_exercises').update({
      sets: parseInt(exercise.sets) || 3,
      reps: exercise.reps || '8-10',
      weight_kg: exercise.weight_kg ? parseFloat(exercise.weight_kg) : null,
      rest_seconds: parseInt(exercise.rest_seconds) || 90,
      notes: exercise.notes || null,
    }).eq('id', exercise.id)
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
      meso_cycle_id: mesoId,
      client_id: clientId,
      session_name: 'Nieuwe training',
      session_type: 'kracht',
      day_of_week: 1,
    })
    await loadSessions(mesoId)
  }

  const deleteSession = async (sessionId) => {
    if (!confirm('Training verwijderen?')) return
    // Verwijder eerst oefeningen
    await supabase.from('session_exercises').delete().eq('session_id', sessionId)
    await supabase.from('training_sessions').delete().eq('id', sessionId)
    await loadSessions(mesos[selectedWeek].id)
  }

  const addExercise = async (sessionId) => {
    // FIXED: gebruik eerste beschikbare oefening i.p.v. hardcoded 'Squat'
    let exId = allExercises[0]?.id
    if (!exId) {
      // Maak een placeholder oefening aan als er geen zijn
      const { data: newEx } = await supabase.from('exercises').insert({ name: 'Oefening', category: 'kracht' }).select().single()
      exId = newEx?.id
    }
    if (!exId) return
    await supabase.from('session_exercises').insert({
      session_id: sessionId,
      exercise_id: exId,
      order_index: sessions.find(s => s.id === sessionId)?.session_exercises?.length || 0,
      sets: 3,
      reps: '8-10',
      rest_seconds: 90,
    })
    await loadSessions(mesos[selectedWeek].id)
  }

  const inp = {
    background: 'var(--dark4)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text)',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: 13,
    padding: '6px 8px',
    outline: 'none',
    width: '100%',
    colorScheme: 'dark',
  }

  if (loading) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 24, color: 'var(--orange)' }}>LADEN...</div>
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
        <a href={`/dashboard/coach/clients/${clientId}`}
          style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Klant
        </a>
      </header>

      <main style={{ padding: '32px 40px' }}>
        {/* Plan header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 6 }}>Trainingsplan</div>
          <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{plan?.name}</h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {plan?.goal && <span style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>🎯 {plan.goal}</span>}
            {plan?.start_date && (
              <span style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>
                📅 {new Date(plan.start_date).toLocaleDateString('nl-NL')} → {plan.end_date ? new Date(plan.end_date).toLocaleDateString('nl-NL') : '...'}
              </span>
            )}
            <span style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>📋 {mesos.length} weken</span>
          </div>
        </div>

        {/* Week tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16, flexWrap: 'wrap' }}>
          {mesos.map((m, i) => (
            <button key={m.id} onClick={() => selectWeek(i)}
              style={{ background: selectedWeek === i ? 'var(--orange)' : 'var(--dark2)', color: selectedWeek === i ? '#000' : 'var(--muted)', ...B, fontWeight: selectedWeek === i ? 700 : 400, fontSize: 12, letterSpacing: 1, padding: '8px 14px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span>W{m.week_number}</span>
              <span style={{ fontSize: 9, opacity: 0.8 }}>{m.focus}</span>
            </button>
          ))}
        </div>

        {/* Week info */}
        {mesos[selectedWeek] && (
          <div style={{ background: 'var(--dark2)', padding: '16px 24px', marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Focus</div>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>{mesos[selectedWeek].focus?.toUpperCase()}</div>
            </div>
            <div>
              <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Intensiteit</div>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, color: INTENSITY_COLORS[mesos[selectedWeek].intensity] || 'var(--orange)' }}>
                {INTENSITY_LABELS[mesos[selectedWeek].intensity] || mesos[selectedWeek].intensity}
              </div>
            </div>
            {mesos[selectedWeek].notes && (
              <div>
                <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Notities</div>
                <div style={{ ...B, fontSize: 13, color: '#aaa' }}>{mesos[selectedWeek].notes}</div>
              </div>
            )}
            <button onClick={() => addSession(mesos[selectedWeek].id)}
              style={{ marginLeft: 'auto', background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
              + Training toevoegen
            </button>
          </div>
        )}

        {/* Sessions */}
        {sessions.length === 0 ? (
          <div style={{ background: 'var(--dark2)', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏋️</div>
            <div style={{ ...D, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Geen trainingen deze week</div>
            <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Voeg een training toe aan week {mesos[selectedWeek]?.week_number}.</div>
            <button onClick={() => addSession(mesos[selectedWeek]?.id)}
              style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', border: 'none', cursor: 'pointer' }}>
              + Training toevoegen
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
            {sessions.map(session => (
              <div key={session.id} style={{ background: 'var(--dark2)', padding: 24 }}>
                {/* Session header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ ...B, fontSize: 11, color: 'var(--orange)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                      {DAYS[(session.day_of_week || 1) - 1]}
                    </div>
                    <div style={{ ...D, fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>{session.session_name}</div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{session.session_type}</div>
                  </div>
                  <button onClick={() => deleteSession(session.id)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.5)', cursor: 'pointer', fontSize: 16, padding: 4 }}
                    title="Verwijder training">✕</button>
                </div>

                {/* Exercises */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  {session.session_exercises?.map((ex, i) => (
                    <div key={ex.id}>
                      {editingExercise?.id === ex.id ? (
                        <div style={{ background: 'var(--dark3)', padding: 12 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 70px 70px 70px', gap: 6, marginBottom: 8 }}>
                            <div>
                              <select
                                value={editingExercise.exercise_id}
                                onChange={e => {
                                  const ex = allExercises.find(x => x.id === e.target.value)
                                  setEditingExercise(p => ({ ...p, exercise_id: e.target.value, exercises: ex }))
                                }}
                                style={{ ...inp, colorScheme: 'dark' }}
                              >
                                {allExercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                              </select>
                            </div>
                            <input type="number" value={editingExercise.sets} onChange={e => setEditingExercise(p => ({...p, sets: e.target.value}))} style={inp} placeholder="Sets" />
                            <input value={editingExercise.reps} onChange={e => setEditingExercise(p => ({...p, reps: e.target.value}))} style={inp} placeholder="Reps" />
                            <input type="number" step="0.5" value={editingExercise.weight_kg || ''} onChange={e => setEditingExercise(p => ({...p, weight_kg: e.target.value}))} style={inp} placeholder="KG" />
                            <input type="number" value={editingExercise.rest_seconds || 90} onChange={e => setEditingExercise(p => ({...p, rest_seconds: e.target.value}))} style={inp} placeholder="Rust" />
                          </div>
                          <input value={editingExercise.notes || ''} onChange={e => setEditingExercise(p => ({...p, notes: e.target.value}))} style={{...inp, width: '100%', marginBottom: 8}} placeholder="Notities..." />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => saveExercise(editingExercise)} disabled={saving}
                              style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 1, padding: '6px 16px', border: 'none', cursor: 'pointer' }}>
                              {saving ? '...' : '✓ Opslaan'}
                            </button>
                            <button onClick={() => setEditingExercise(null)}
                              style={{ background: 'none', border: '1px solid var(--muted2)', color: 'var(--muted)', ...B, fontSize: 11, padding: '6px 12px', cursor: 'pointer' }}>
                              Annuleer
                            </button>
                            <button onClick={() => deleteExercise(ex.id)}
                              style={{ background: 'none', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', ...B, fontSize: 11, padding: '6px 12px', cursor: 'pointer', marginLeft: 'auto' }}>
                              Verwijder
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => setEditingExercise({...ex})}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--dark3)', cursor: 'pointer' }}>
                          <span style={{ ...D, fontSize: 12, color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{i + 1}</span>
                          <span style={{ ...B, fontSize: 13, flex: 1 }}>{ex.exercises?.name}</span>
                          <span style={{ ...B, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                            {ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--muted2)', marginLeft: 4 }}>✎</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={() => addExercise(session.id)}
                  style={{ background: 'none', border: '1px dashed var(--muted2)', color: 'var(--muted)', ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '7px', cursor: 'pointer', width: '100%' }}>
                  + Oefening
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
