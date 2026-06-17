'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const DAYS = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag']
const TYPES = ['kracht','conditie','gecombineerd','mobiliteit','herstel']
const TC = { kracht:'#4ade80', conditie:'#38e8e8', gecombineerd:'#fb923c', mobiliteit:'#a78bfa', herstel:'#60a5fa' }
const IC = { low:'#4ade80', medium:'#fb923c', high:'#f87171', deload:'#60a5fa' }
const IL = { low:'Laag', medium:'Gemiddeld', high:'Hoog', deload:'Deload' }

const inp = { background:'var(--dark4)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, padding:'8px 10px', outline:'none', colorScheme:'dark', width:'100%' }
const lbl = { fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:'2px', color:'#888', textTransform:'uppercase', display:'block', marginBottom:4 }

function calcSpeed(t) {
  if (!t || !String(t).includes(':')) return null
  const [m,s] = String(t).split(':')
  const min = parseInt(m) + parseInt(s||0)/60
  return min > 0 ? (60/min).toFixed(1) : null
}
function parseMode(notes) {
  if (!notes || !notes.startsWith('{')) return null
  try { return JSON.parse(notes) } catch { return null }
}

export default function PlanView({ params }) {
  const [ids, setIds] = React.useState({ clientId:null, planId:null })
  const [plan, setPlan] = React.useState(null)
  const [mesos, setMesos] = React.useState([])
  const [wi, setWi] = React.useState(0)
  const [sessions, setSessions] = React.useState([])
  const [exLib, setExLib] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [deleting, setDeleting] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Werkt met zowel Next.js 15 (Promise) als ouder (plain object)
  React.useEffect(() => {
    Promise.resolve(params).then(p => {
      setIds({ clientId: p.id, planId: p.planId })
    })
  }, [])

  React.useEffect(() => {
    if (!ids.planId) return
    init()
  }, [ids.planId])

  const init = async () => {
    setLoading(true)
    const { data: p } = await supabase.from('macro_plans').select('*').eq('id', ids.planId).single()
    setPlan(p)
    const { data: m } = await supabase.from('meso_cycles').select('*').eq('macro_plan_id', ids.planId).order('week_number')
    setMesos(m || [])
    if (m?.length) await loadWeek(m[0].id)
    const { data: ex } = await supabase.from('exercises').select('id,name').order('name')
    setExLib(ex || [])
    setLoading(false)
  }

  const loadWeek = async (mesoId) => {
    const { data } = await supabase.from('training_sessions')
      .select('*, session_exercises(*, exercises(*))')
      .eq('meso_cycle_id', mesoId).order('day_of_week')
    setSessions(data || [])
  }

  const switchWeek = async (i) => {
    setWi(i)
    if (mesos[i]) await loadWeek(mesos[i].id)
  }

  const updSess = (id, f, v) => setSessions(p => p.map(s => s.id===id ? {...s,[f]:v} : s))

  const saveSess = async (s) => {
    await supabase.from('training_sessions').update({
      session_name: s.session_name, session_type: s.session_type,
      day_of_week: parseInt(s.day_of_week)||1
    }).eq('id', s.id)
  }

  const addSess = async () => {
    const mesoId = mesos[wi]?.id; if (!mesoId) return
    await supabase.from('training_sessions').insert({
      meso_cycle_id:mesoId, client_id:ids.clientId,
      session_name:'Nieuwe training', session_type:'kracht', day_of_week:1
    })
    await loadWeek(mesoId)
  }

  const delSess = async (id) => {
    if (!confirm('Training verwijderen?')) return
    await supabase.from('session_exercises').delete().eq('session_id', id)
    await supabase.from('training_sessions').delete().eq('id', id)
    await loadWeek(mesos[wi].id)
  }

  const updEx = (sId, eId, f, v) => setSessions(p => p.map(s =>
    s.id!==sId ? s : {...s, session_exercises: s.session_exercises.map(e => e.id!==eId ? e : {...e,[f]:v})}
  ))

  const saveEx = async (ex, sType) => {
    const d = parseMode(ex.notes)
    const mode = ex._mode || d?._mode || (sType==='conditie'?'conditie':sType==='mobiliteit'?'mobiliteit':'kracht')
    let reps=null, wkg=null, notes=null
    if (mode==='conditie') {
      const spd = calcSpeed(ex._tempo||d?.tempo||'')
      notes = JSON.stringify({ _mode:'conditie', distance_m:parseInt(ex._dist||d?.distance_m)||null, rest_s:parseInt(ex.rest_seconds||d?.rest_s)||180, tempo:ex._tempo||d?.tempo||null, speed_kmh:spd?parseFloat(spd):null })
    } else if (mode==='mobiliteit') {
      notes = JSON.stringify({ _mode:'mobiliteit', hold_s:parseInt(ex._hold||d?.hold_s)||30, hold_type:ex._htype||d?.hold_type||'statisch', rest_s:parseInt(ex.rest_seconds||d?.rest_s)||30 })
    } else {
      reps = ex.reps||'8-10'; wkg = ex.weight_kg?parseFloat(ex.weight_kg):null; notes = ex._notes||null
    }
    await supabase.from('session_exercises').update({ sets:parseInt(ex.sets)||3, reps, weight_kg:wkg, rest_seconds:parseInt(ex.rest_seconds)||90, notes }).eq('id', ex.id)
  }

  const addEx = async (s) => {
    if (!exLib.length) { alert('Voeg eerst oefeningen toe aan de bibliotheek'); return }
    const isC = s.session_type==='conditie', isM = s.session_type==='mobiliteit'
    const notes = isC ? JSON.stringify({_mode:'conditie',distance_m:400,rest_s:180,tempo:'5:00',speed_kmh:12}) :
                  isM ? JSON.stringify({_mode:'mobiliteit',hold_s:30,hold_type:'statisch',rest_s:30}) : null
    await supabase.from('session_exercises').insert({
      session_id:s.id, exercise_id:exLib[0].id,
      sets:isC?4:3, reps:isC||isM?null:'8-10', rest_seconds:isC?180:isM?30:90, notes,
      order_index:s.session_exercises?.length||0
    })
    await loadWeek(mesos[wi].id)
  }

  const delEx = async (eId, sId) => {
    await supabase.from('session_exercises').delete().eq('id', eId)
    setSessions(p => p.map(s => s.id!==sId ? s : {...s, session_exercises:s.session_exercises.filter(e=>e.id!==eId)}))
  }

  const deletePlan = async () => {
    if (!confirm('VOLLEDIGE trainingsplan verwijderen? Dit kan niet ongedaan worden.')) return
    setDeleting(true)
    for (const m of mesos) {
      const { data:sl } = await supabase.from('training_sessions').select('id').eq('meso_cycle_id',m.id)
      for (const s of sl||[]) {
        await supabase.from('session_exercises').delete().eq('session_id',s.id)
        await supabase.from('session_logs').delete().eq('session_id',s.id)
      }
      await supabase.from('training_sessions').delete().eq('meso_cycle_id',m.id)
      await supabase.from('meso_cycles').delete().eq('id',m.id)
    }
    await supabase.from('macro_plans').delete().eq('id', ids.planId)
    router.push(`/dashboard/coach/clients/${ids.clientId}`)
  }

  if (loading || !ids.planId) return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', ...D, fontSize:22, color:'var(--orange)', letterSpacing:3 }}>
      LADEN...
    </div>
  )

  return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', ...B }}>
      <header style={{ background:'var(--dark2)', borderBottom:'1px solid rgba(255,77,0,0.12)', padding:'14px clamp(16px,4vw,40px)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="20" height="18" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
          </svg>
          <span style={{ ...D, fontSize:15, letterSpacing:3, fontWeight:700, color:'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <a href={`/dashboard/coach/clients/${ids.clientId}`} style={{ ...B, fontSize:11, letterSpacing:2, color:'var(--muted)', textDecoration:'none', textTransform:'uppercase' }}>← Klant</a>
          <button onClick={deletePlan} disabled={deleting}
            style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.35)', color:'#f87171', ...B, fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'7px 14px', cursor:'pointer' }}>
            {deleting ? 'Verwijderen...' : '🗑 Verwijder plan'}
          </button>
        </div>
      </header>

      <main style={{ padding:'clamp(16px,4vw,40px)' }}>
        {/* Plan naam + doel */}
        <div style={{ marginBottom:20 }}>
          <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:5 }}>Trainingsplan wijzigen</div>
          <div style={{ ...D, fontSize:'clamp(24px,4vw,42px)', fontWeight:700, letterSpacing:2, marginBottom:4 }}>{plan?.name?.toUpperCase()}</div>
          {plan?.goal && <div style={{ ...B, fontSize:14, color:'var(--muted)' }}>🎯 {plan.goal}</div>}
        </div>

        {/* Week tabs */}
        <div style={{ display:'flex', gap:3, marginBottom:4, flexWrap:'wrap' }}>
          {mesos.map((m,i) => (
            <button key={m.id} onClick={() => switchWeek(i)}
              style={{ background:wi===i?'var(--orange)':'var(--dark2)', color:wi===i?'#000':'var(--muted)', ...B, fontWeight:wi===i?700:400, fontSize:12, letterSpacing:1, textTransform:'uppercase', padding:'8px 16px', border:'none', cursor:'pointer' }}>
              W{m.week_number}
            </button>
          ))}
        </div>

        {/* Week info */}
        {mesos[wi] && (
          <div style={{ background:'var(--dark2)', padding:'12px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ ...B, fontSize:9, letterSpacing:2, color:'var(--muted)', textTransform:'uppercase', marginBottom:2 }}>Intensiteit</div>
              <div style={{ ...D, fontSize:14, fontWeight:700, color:IC[mesos[wi].intensity]||'var(--orange)' }}>{IL[mesos[wi].intensity]||mesos[wi].intensity}</div>
            </div>
            <button onClick={addSess} style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', padding:'8px 18px', border:'none', cursor:'pointer' }}>
              + Dag toevoegen
            </button>
          </div>
        )}

        {/* Sessies — zelfde format als aanmaken */}
        {sessions.length === 0 ? (
          <div style={{ background:'var(--dark2)', padding:48, textAlign:'center' }}>
            <div style={{ ...D, fontSize:18, fontWeight:700, marginBottom:12 }}>Geen trainingen in week {wi+1}</div>
            <button onClick={addSess} style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', padding:'12px 28px', border:'none', cursor:'pointer' }}>
              + Dag toevoegen
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {sessions.map(s => {
              const tc = TC[s.session_type]||'var(--orange)'
              const isGec = s.session_type==='gecombineerd'
              return (
                <div key={s.id} style={{ background:'var(--dark2)', padding:'20px 24px' }}>
                  {/* Sessie header — altijd bewerkbaar */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 180px 160px 36px', gap:10, marginBottom:16, alignItems:'end' }}>
                    <div>
                      <label style={lbl}>Naam training</label>
                      <input value={s.session_name||''} onChange={e=>updSess(s.id,'session_name',e.target.value)} onBlur={()=>saveSess(s)} style={{...inp,fontSize:15,fontWeight:600}} placeholder="Bijv. Kracht Boven..." />
                    </div>
                    <div>
                      <label style={lbl}>Type</label>
                      <select value={s.session_type} style={inp}
                        onChange={e=>{updSess(s.id,'session_type',e.target.value); setTimeout(()=>saveSess({...s,session_type:e.target.value}),50)}}>
                        {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Dag</label>
                      <select value={s.day_of_week||1} style={inp}
                        onChange={e=>{updSess(s.id,'day_of_week',e.target.value); setTimeout(()=>saveSess({...s,day_of_week:e.target.value}),50)}}>
                        {DAYS.map((d,i)=><option key={i+1} value={i+1}>{d}</option>)}
                      </select>
                    </div>
                    <button onClick={()=>delSess(s.id)} style={{ background:'none', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', cursor:'pointer', padding:'0 8px', fontSize:16, height:38 }}>✕</button>
                  </div>

                  {/* Oefeningen label */}
                  <div style={{ ...B, fontSize:10, letterSpacing:3, color:'var(--orange)', textTransform:'uppercase', marginBottom:10 }}>Oefeningen</div>

                  {s.session_exercises?.map((ex) => {
                    const d = parseMode(ex.notes)
                    const mode = ex._mode||d?._mode||(s.session_type==='conditie'?'conditie':s.session_type==='mobiliteit'?'mobiliteit':'kracht')
                    const isC = mode==='conditie', isM = mode==='mobiliteit'
                    const tempo = ex._tempo||d?.tempo||''
                    const spd = calcSpeed(tempo)
                    return (
                      <div key={ex.id} style={{ background:'var(--dark3)', padding:'12px 14px', marginBottom:8, borderLeft:`2px solid ${TC[mode]||tc}` }}>
                        {/* Naam + mode toggle */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 28px', gap:8, marginBottom:8 }}>
                          <select value={ex.exercise_id} style={{...inp,fontWeight:600,fontSize:14}}
                            onChange={async e=>{
                              const f=exLib.find(x=>x.id===e.target.value)
                              updEx(s.id,ex.id,'exercise_id',e.target.value)
                              updEx(s.id,ex.id,'exercises',f)
                              await supabase.from('session_exercises').update({exercise_id:e.target.value}).eq('id',ex.id)
                            }}>
                            {exLib.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                          <button onClick={()=>delEx(ex.id,s.id)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:16,padding:0}}>✕</button>
                        </div>
                        {isGec && (
                          <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                            {['kracht','conditie','mobiliteit'].map(m=>(
                              <button key={m} onClick={()=>{updEx(s.id,ex.id,'_mode',m)}}
                                style={{flex:1,padding:'4px',background:mode===m?TC[m]:'var(--dark4)',color:mode===m?'#000':'var(--muted)',border:`1px solid ${mode===m?TC[m]:'rgba(255,255,255,0.08)'}`,cursor:'pointer',...B,fontSize:10,fontWeight:mode===m?700:400,textTransform:'uppercase',letterSpacing:1}}>
                                {m}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* KRACHT */}
                        {!isC && !isM && (
                          <div style={{ display:'grid', gridTemplateColumns:'60px 80px 80px 80px 1fr', gap:8 }}>
                            {[['Sets','number','sets','3'],['Reps','text','reps','8-10'],['KG','number','weight_kg','—'],['Rust(s)','number','rest_seconds','90']].map(([h,t,f,ph])=>(
                              <div key={f}>
                                <label style={lbl}>{h}</label>
                                <input type={t} placeholder={ph} value={ex[f]||''} step={f==='weight_kg'?'0.5':undefined}
                                  onChange={e=>updEx(s.id,ex.id,f,e.target.value)}
                                  onBlur={()=>saveEx(ex,s.session_type)}
                                  style={{...inp,textAlign:['sets','weight_kg','rest_seconds'].includes(f)?'center':'left'}} />
                              </div>
                            ))}
                            <div>
                              <label style={lbl}>Notities</label>
                              <input value={ex._notes||(d?._mode?'':ex.notes||'')} onChange={e=>updEx(s.id,ex.id,'_notes',e.target.value)} onBlur={()=>saveEx(ex,s.session_type)} style={inp} placeholder="Bijv. RIR 2..." />
                            </div>
                          </div>
                        )}
                        {/* CONDITIE */}
                        {isC && (
                          <div>
                            <div style={{ display:'grid', gridTemplateColumns:'60px 100px 120px 90px', gap:8, marginBottom:6 }}>
                              <div><label style={lbl}>Intervals</label><input type="number" value={ex.sets||4} onChange={e=>updEx(s.id,ex.id,'sets',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'conditie',_dist:ex._dist||d?.distance_m,_tempo:tempo},s.session_type)} style={{...inp,textAlign:'center'}} /></div>
                              <div><label style={lbl}>Afstand (m)</label><input type="number" placeholder="400" value={ex._dist??d?.distance_m??''} onChange={e=>updEx(s.id,ex.id,'_dist',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'conditie'},s.session_type)} style={{...inp,textAlign:'center'}} /></div>
                              <div><label style={lbl}>Tempo (min:sec/km)</label><input placeholder="5:30" value={tempo} onChange={e=>updEx(s.id,ex.id,'_tempo',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'conditie'},s.session_type)} style={inp} /></div>
                              <div><label style={lbl}>Rust (s)</label><input type="number" value={ex.rest_seconds||d?.rest_s||180} onChange={e=>updEx(s.id,ex.id,'rest_seconds',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'conditie'},s.session_type)} style={{...inp,textAlign:'center'}} /></div>
                            </div>
                            {spd&&<div style={{background:'rgba(56,232,232,0.08)',border:'1px solid rgba(56,232,232,0.2)',padding:'6px 12px',display:'flex',gap:16}}><span style={{...B,fontSize:12,color:'#38e8e8'}}>⚡ <strong>{spd} km/h</strong></span><span style={{...B,fontSize:11,color:'#888'}}>{tempo} min/km</span></div>}
                          </div>
                        )}
                        {/* MOBILITEIT */}
                        {isM && (
                          <div>
                            <div style={{ display:'grid', gridTemplateColumns:'60px 120px 90px', gap:8, marginBottom:8 }}>
                              <div><label style={lbl}>Sets</label><input type="number" value={ex.sets||3} onChange={e=>updEx(s.id,ex.id,'sets',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'mobiliteit',_hold:ex._hold||d?.hold_s,_htype:ex._htype||d?.hold_type},s.session_type)} style={{...inp,textAlign:'center'}} /></div>
                              <div><label style={lbl}>Vasthoud (sec)</label><input type="number" placeholder="30" value={ex._hold??d?.hold_s??30} onChange={e=>updEx(s.id,ex.id,'_hold',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'mobiliteit'},s.session_type)} style={{...inp,textAlign:'center'}} /></div>
                              <div><label style={lbl}>Rust (s)</label><input type="number" value={ex.rest_seconds||d?.rest_s||30} onChange={e=>updEx(s.id,ex.id,'rest_seconds',e.target.value)} onBlur={()=>saveEx({...ex,_mode:'mobiliteit'},s.session_type)} style={{...inp,textAlign:'center'}} /></div>
                            </div>
                            <div style={{display:'flex',gap:4}}>
                              {['statisch','dynamisch'].map(t=>{
                                const cur=ex._htype||d?.hold_type||'statisch'
                                return <button key={t} onClick={()=>{updEx(s.id,ex.id,'_htype',t);saveEx({...ex,_mode:'mobiliteit',_htype:t},s.session_type)}}
                                  style={{flex:1,padding:'5px',background:cur===t?'#a78bfa':'var(--dark4)',color:cur===t?'#000':'var(--muted)',border:`1px solid ${cur===t?'#a78bfa':'rgba(255,255,255,0.08)'}`,cursor:'pointer',...B,fontSize:10,fontWeight:cur===t?700:400,textTransform:'uppercase',letterSpacing:1}}>{t}</button>
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button onClick={()=>addEx(s)} style={{background:'none',border:'1px dashed var(--muted2)',color:'var(--muted)',...B,fontSize:11,letterSpacing:2,textTransform:'uppercase',padding:'8px',cursor:'pointer',width:'100%',marginTop:4}}>
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
