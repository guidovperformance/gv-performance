'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const NORMS = {
  mobility:      { standard: 5,    good: 7,    elite: 8,    pro: 10,   higher: true  },
  broad_jump:    { standard: 190,  good: 210,  elite: 230,  pro: 250,  higher: true  },
  deadlift_1rm:  { standard: 120,  good: 150,  elite: 180,  pro: 200,  higher: true  },
  bench_1rm:     { standard: 70,   good: 90,   elite: 110,  pro: 130,  higher: true  },
  illinois:      { standard: 17.0, good: 16.0, elite: 15.0, pro: 14.5, higher: false },
  pullup_max:    { standard: 8,    good: 12,   elite: 16,   pro: 20,   higher: true  },
  bp_bw_reps:    { standard: 10,   good: 15,   elite: 18,   pro: 20,   higher: true  },
  dead_hang_sec: { standard: 30,   good: 60,   elite: 90,   pro: 120,  higher: true  },
  plank_sec:     { standard: 60,   good: 120,  elite: 180,  pro: 300,  higher: true  },
  sprint_400m:   { standard: 75,   good: 65,   elite: 58,   pro: 52,   higher: false },
  loop_1500m:    { standard: 360,  good: 330,  elite: 300,  pro: 270,  higher: false },
  farmers_carry: { standard: 50,   good: 100,  elite: 200,  pro: 400,  higher: true  },
}

function getLevel(key, value) {
  if (!value && value !== 0) return null
  const n = NORMS[key]
  if (!n) return null
  const v = parseFloat(value)
  if (n.higher) {
    if (v >= n.pro) return 'PRO'
    if (v >= n.elite) return 'ELITE'
    if (v >= n.good) return 'GOOD'
    if (v >= n.standard) return 'STANDARD'
    return 'BELOW'
  } else {
    if (v <= n.pro) return 'PRO'
    if (v <= n.elite) return 'ELITE'
    if (v <= n.good) return 'GOOD'
    if (v <= n.standard) return 'STANDARD'
    return 'BELOW'
  }
}

const LEVEL_COLORS = { PRO: '#a855f7', ELITE: '#f87171', GOOD: '#fb923c', STANDARD: '#4ade80', BELOW: '#6b7280' }
const LEVEL_LABELS = { PRO: 'PRO', ELITE: 'ELITE', GOOD: 'GOOD', STANDARD: 'STANDARD', BELOW: 'BELOW' }

function LevelBadge({ level }) {
  if (!level) return null
  return (
    <span style={{ background: LEVEL_COLORS[level] + '22', color: LEVEL_COLORS[level], border: `1px solid ${LEVEL_COLORS[level]}44`, fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '3px 10px', textTransform: 'uppercase' }}>
      {LEVEL_LABELS[level]}
    </span>
  )
}

function estimate1RM(kg, reps) {
  if (!kg || !reps || reps <= 0) return null
  if (parseInt(reps) === 1) return parseFloat(kg)
  return Math.round(parseFloat(kg) * (1 + parseInt(reps) / 30))
}

function calcMAS(sec) { return sec > 0 ? (1500 / sec).toFixed(2) : null }
function masLevel(mas) {
  if (!mas) return null
  const m = parseFloat(mas)
  if (m > 4.96) return { level: 'Elite', color: '#f87171' }
  if (m >= 3.90) return { level: 'Gevorderd', color: '#fb923c' }
  if (m >= 2.85) return { level: 'Gemiddeld', color: '#4ade80' }
  return { level: 'Beginner', color: '#6b7280' }
}

const inp = { background: 'var(--dark3)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 15, padding: '12px 14px', outline: 'none', width: '100%', colorScheme: 'dark' }
const lbl = { fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }

const SECTIONS = [
  { id: 'meta',      label: '📋 Algemeen',              short: 'Algemeen'   },
  { id: 'warmup',    label: '🔥 Warming-up',             short: 'Warm-up'    },
  { id: 'mobility',  label: '1. Mobility Screen',        short: 'Mobility'   },
  { id: 'broad',     label: '2. Broad Jump',             short: 'Broad Jump' },
  { id: 'deadlift',  label: '3. Hexbar Deadlift',        short: 'Deadlift'   },
  { id: 'bench',     label: '4. Bench Press 1-5RM',      short: 'Bench 1RM'  },
  { id: 'illinois',  label: '5. Illinois Agility',       short: 'Agility'    },
  { id: 'pullup',    label: '6. Max Pull-ups',            short: 'Pull-ups'   },
  { id: 'bench_bw',  label: '7. Bench @ Lichaamsgewicht',short: 'Bench BW'   },
  { id: 'dedhang',   label: '8. Dead Hang Hold',         short: 'Dead Hang'  },
  { id: 'plank',     label: '9. Plank Hold',             short: 'Plank'      },
  { id: 'sprint400', label: '10. 400m Sprint',           short: '400m'       },
  { id: 'run1500',   label: '11. 1500m Run',             short: '1500m'      },
  { id: 'looptesten', label: '12. Looptesten',            short: 'Lopen'      },
  { id: 'carry',     label: "12. Farmer's Carry",        short: 'Carry'      },
  { id: 'overzicht', label: '📊 Overzicht',              short: 'Overzicht'  },
]

export default function TestProtocol({ params }) {
  const [clientId, setClientId] = React.useState(null)
  const [status, setStatus] = React.useState('idle')
  const [active, setActive] = React.useState('meta')
  const router = useRouter()
  const supabase = createClient()

  const [f, setF] = React.useState({
    test_date: new Date().toISOString().split('T')[0], test_type: 'intake',
    geslacht: 'man', leeftijd: '', functiecluster: '1-3',
    weight_kg: '', height_cm: '', body_fat_pct: '',
    blessure: 'nee', blessure_omschrijving: '',
    mob_a: '', mob_b: '', mob_c: '', mob_d: '', mob_e: '',
    broad_jump_cm: '',
    dl_w1_kg: '', dl_w1_reps: '6', dl_w2_kg: '', dl_w2_reps: '3',
    dl_test_kg: '', dl_test_reps: '',
    bp_w1_kg: '', bp_w1_reps: '6', bp_w2_kg: '', bp_w2_reps: '3',
    bp_test_kg: '', bp_test_reps: '',
    illinois_sec: '',
    pullup_max: '',
    bp_bw_reps: '',
    dead_hang_min: '', dead_hang_sec: '',
    plank_min: '', plank_sec_f: '',
    sprint_400m_sec: '',
    loop_min: '', loop_sec: '', resting_hr: '',
    cooper_12min_m: '', mas_6min_m: '',
    run_5km_min: '', run_5km_sec_f: '',
    run_10km_min: '', run_10km_sec_f: '',
    farmers_carry_m: '',
    notes: '',
  })

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  React.useEffect(() => { params.then(p => setClientId(p.id)) }, [params])

  const mobilityScore = ['mob_a','mob_b','mob_c','mob_d','mob_e'].reduce((s, k) => s + (parseInt(f[k]) || 0), 0)
  const dl1rm = estimate1RM(f.dl_test_kg, f.dl_test_reps)
  const bp1rm = estimate1RM(f.bp_test_kg, f.bp_test_reps)
  const dead_hang_total = (parseInt(f.dead_hang_min) || 0) * 60 + (parseInt(f.dead_hang_sec) || 0)
  const plank_total = (parseInt(f.plank_min) || 0) * 60 + (parseInt(f.plank_sec_f) || 0)
  const loop_total = (parseInt(f.loop_min) || 0) * 60 + (parseInt(f.loop_sec) || 0)
  const mas = loop_total > 0 ? calcMAS(loop_total) : null

  // Looptesten berekeningen
  const cooper_mas = f.cooper_12min_m ? (parseInt(f.cooper_12min_m) / 720).toFixed(2) : null
  const cooper_vo2max = f.cooper_12min_m ? ((parseInt(f.cooper_12min_m) - 504.9) / 44.73).toFixed(1) : null
  const mas_6min = f.mas_6min_m ? (parseInt(f.mas_6min_m) / 360).toFixed(2) : null
  const run5km_total = (parseInt(f.run_5km_min)||0)*60 + (parseInt(f.run_5km_sec_f)||0)
  const run10km_total = (parseInt(f.run_10km_min)||0)*60 + (parseInt(f.run_10km_sec_f)||0)
  const run5km_speed  = run5km_total  > 0 ? (18000/run5km_total).toFixed(1)  : null
  const run10km_speed = run10km_total > 0 ? (36000/run10km_total).toFixed(1) : null
  const run5km_pace   = run5km_total  > 0 ? `\${Math.floor(run5km_total/5/60)}:\${String(Math.round((run5km_total/5)%60)).padStart(2,'0')}` : null
  const run10km_pace  = run10km_total > 0 ? `\${Math.floor(run10km_total/10/60)}:\${String(Math.round((run10km_total/10)%60)).padStart(2,'0')}` : null
  // Beste MAS voor trainingszones
  const best_mas = cooper_mas || mas_6min || mas || null
  const masZones = best_mas ? [
    { zone:'Z1 Herstel',       pct:0.65, kmh:(parseFloat(best_mas)*3.6*0.65).toFixed(1) },
    { zone:'Z2 Duurloop',      pct:0.75, kmh:(parseFloat(best_mas)*3.6*0.75).toFixed(1) },
    { zone:'Z3 Drempelzone',   pct:0.87, kmh:(parseFloat(best_mas)*3.6*0.87).toFixed(1) },
    { zone:'Z4 Intervalzone',  pct:0.95, kmh:(parseFloat(best_mas)*3.6*0.95).toFixed(1) },
    { zone:'Z5 VO2max',        pct:1.05, kmh:(parseFloat(best_mas)*3.6*1.05).toFixed(1) },
  ] : null
  const masInfo = masLevel(mas)
  const navIdx = SECTIONS.findIndex(s => s.id === active)

  const handleSave = async () => {
    setStatus('loading')
    // Gebruik API route met supabaseAdmin — bypast RLS zodat coach test kan opslaan
    const res = await fetch('/api/dashboard/save-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        test_date: f.test_date, test_type: f.test_type,
        geslacht: f.geslacht,
        leeftijd: f.leeftijd ? parseInt(f.leeftijd) : null,
        functiecluster: f.functiecluster,
        weight_kg: f.weight_kg ? parseFloat(f.weight_kg) : null,
        height_cm: f.height_cm ? parseFloat(f.height_cm) : null,
        body_fat_pct: f.body_fat_pct ? parseFloat(f.body_fat_pct) : null,
        resting_hr: f.resting_hr ? parseInt(f.resting_hr) : null,
        blessure_aanwezig: f.blessure === 'ja',
        blessure_omschrijving: f.blessure_omschrijving || null,
        mobility_score: mobilityScore || null,
        broad_jump_cm: f.broad_jump_cm ? parseFloat(f.broad_jump_cm) : null,
        deadlift_1rm: dl1rm,
        deadlift_werkset_kg: f.dl_test_kg ? parseFloat(f.dl_test_kg) : null,
        deadlift_werkset_reps: f.dl_test_reps ? parseInt(f.dl_test_reps) : null,
        bench_1rm: bp1rm,
        bench_werkset_kg: f.bp_test_kg ? parseFloat(f.bp_test_kg) : null,
        bench_werkset_reps: f.bp_test_reps ? parseInt(f.bp_test_reps) : null,
        illinois_sec: f.illinois_sec ? parseFloat(f.illinois_sec) : null,
        pullup_max: f.pullup_max ? parseInt(f.pullup_max) : null,
        bp_bw_reps: f.bp_bw_reps ? parseInt(f.bp_bw_reps) : null,
        dead_hang_sec: dead_hang_total || null,
        plank_sec: plank_total || null,
        sprint_400m_sec: f.sprint_400m_sec ? parseFloat(f.sprint_400m_sec) : null,
        loop_1500m_sec: loop_total || null,
        cooper_12min_m: f.cooper_12min_m ? parseInt(f.cooper_12min_m) : null,
        mas_veldtest_6min_m: f.mas_6min_m ? parseInt(f.mas_6min_m) : null,
        run_5km_sec: run5km_total || null,
        run_10km_sec: run10km_total || null,
        mas: mas ? parseFloat(mas) : null,
        farmers_carry_m: f.farmers_carry_m ? parseFloat(f.farmers_carry_m) : null,
        notes: f.notes || null,
      })
    })
    // Veilig JSON parsen - voorkomt crash als response geen JSON is
    let result = {}
    try { result = await res.json() } catch { result = { error: 'Server response onleesbaar' } }
    
    if (!res.ok || result.error) {
      console.error('Save test error:', result.error || res.status)
      setStatus('error')
      return
    }
    setStatus('success')
    setTimeout(() => router.push(`/dashboard/coach/clients/${clientId}/test`), 2000)
  }

  const FV = ({ label, name, unit, hint, type = 'number', placeholder = '' }) => (
    <div>
      <label style={lbl}>{label}{unit && <span style={{ color: 'var(--orange)', marginLeft: 4 }}>({unit})</span>}</label>
      <input type={type} step="any" placeholder={placeholder} value={f[name] || ''} onChange={e => set(name, e.target.value)} style={inp} />
      {hint && <div style={{ ...B, fontSize: 11, color: 'var(--muted2)', marginTop: 4, fontStyle: 'italic' }}>{hint}</div>}
    </div>
  )

  const TimeIn = ({ label, minKey, secKey, hint }) => (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div><input type="number" min="0" placeholder="Min" value={f[minKey]||''} onChange={e=>set(minKey,e.target.value)} style={{...inp,textAlign:'center'}} /><div style={{...B,fontSize:9,color:'var(--muted)',textAlign:'center',marginTop:2,letterSpacing:1}}>MINUTEN</div></div>
        <div><input type="number" min="0" max="59" placeholder="Sec" value={f[secKey]||''} onChange={e=>set(secKey,e.target.value)} style={{...inp,textAlign:'center'}} /><div style={{...B,fontSize:9,color:'var(--muted)',textAlign:'center',marginTop:2,letterSpacing:1}}>SECONDEN</div></div>
      </div>
      {hint && <div style={{ ...B, fontSize: 11, color: 'var(--muted2)', marginTop: 4, fontStyle: 'italic' }}>{hint}</div>}
    </div>
  )

  const Mob = ({ id, label, desc }) => (
    <div style={{ background: 'var(--dark3)', padding: '14px 16px', marginBottom: 8 }}>
      <div style={{ ...D, fontSize: 15, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>{desc}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[['0','🔴 Beperkt'],['1','🟡 Matig'],['2','🟢 Goed']].map(([v,l]) => (
          <button key={v} onClick={()=>set(id,v)} style={{ background: f[id]===v ? 'rgba(212,168,87,0.2)' : 'var(--dark4)', border: `1px solid ${f[id]===v ? 'var(--orange)' : 'rgba(255,255,255,0.08)'}`, color: f[id]===v ? 'var(--text)' : 'var(--muted)', ...B, fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>{l}</button>
        ))}
        {f[id] !== '' && <span style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)', marginLeft: 8 }}>{f[id]} pt</span>}
      </div>
    </div>
  )

  const Sets = ({ sets }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: 2, marginBottom: 2 }}>
        {['Set','Gewicht (kg)','Herhalingen'].map(h => <div key={h} style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', padding: '6px 10px', background: 'var(--dark4)' }}>{h}</div>)}
      </div>
      {sets.map((s, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: 2, marginBottom: 2 }}>
          <div style={{ ...B, fontSize: 13, padding: '10px', background: s.isTest ? 'rgba(212,168,87,0.08)' : 'var(--dark3)', color: s.isTest ? 'var(--orange)' : 'var(--muted)', border: s.isTest ? '1px solid rgba(212,168,87,0.2)' : 'none', fontWeight: s.isTest ? 700 : 400 }}>{s.label}</div>
          <input type="number" step="0.5" placeholder="Kg" value={f[s.kgKey]||''} onChange={e=>set(s.kgKey,e.target.value)} style={{ ...inp, padding: '10px', background: s.isTest ? 'rgba(212,168,87,0.04)' : 'var(--dark3)' }} />
          <input type="number" placeholder={s.repsHint||'Reps'} value={f[s.repsKey]||''} onChange={e=>set(s.repsKey,e.target.value)} style={{ ...inp, padding: '10px', background: s.isTest ? 'rgba(212,168,87,0.04)' : 'var(--dark3)' }} />
        </div>
      ))}
    </div>
  )

  const Res = ({ value, label, normKey, unit = '' }) => {
    if (!value) return null
    const level = getLevel(normKey, value)
    const n = NORMS[normKey]
    const pct = (() => {
      if (!n) return 0
      const levels = ['BELOW','STANDARD','GOOD','ELITE','PRO']
      return Math.min(100, Math.max(0, (levels.indexOf(level) / 4) * 100))
    })()
    return (
      <div style={{ padding: '16px 20px', background: 'rgba(212,168,87,0.07)', border: '1px solid rgba(212,168,87,0.25)', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <LevelBadge level={level} />
          </div>
          <div style={{ ...D, fontSize: 40, fontWeight: 700, color: 'var(--orange)' }}>{value}{unit}</div>
        </div>
        {n && <div>
          <div style={{ height: 4, background: 'var(--dark4)', borderRadius: 2, marginTop: 8 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: LEVEL_COLORS[level] || 'var(--orange)', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>
            <span>S:{n.standard}</span><span>G:{n.good}</span><span>E:{n.elite}</span><span>P:{n.pro}</span>
          </div>
        </div>}
      </div>
    )
  }

  const Btn = ({ children, onClick, variant = 'primary' }) => (
    <button onClick={onClick} style={{ background: variant === 'primary' ? 'var(--orange)' : variant === 'selected' ? 'rgba(212,168,87,0.2)' : 'var(--dark3)', color: variant === 'primary' ? '#000' : 'var(--text)', ...B, fontWeight: variant === 'primary' ? 700 : 400, fontSize: 13, padding: '8px 20px', border: `1px solid ${variant === 'selected' ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer' }}>{children}</button>
  )

  const SH = ({ title, sub }) => (
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(212,168,87,0.15)' }}>
      <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 1, color: 'var(--orange)' }}>{title}</div>
      {sub && <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>{sub}</div>}
    </div>
  )

  const wrap = (children) => <div style={{ background: 'var(--dark2)', padding: 28 }}>{children}</div>
  const grid2 = (children) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{children}</div>
  const grid3 = (children) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>{children}</div>
  const info = (text) => <div style={{ background: 'var(--dark3)', padding: '12px 16px', ...B, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>{text}</div>

  if (status === 'success') return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
        <div style={{ ...D, fontSize: 32, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>TEST OPGESLAGEN!</div>
        <div style={{ ...B, fontSize: 15, color: 'var(--muted)' }}>Terugsturen naar klantprofiel...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(212,168,87,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34"><polygon points="18,2 13,28 23,28" fill="#D4A857" /><polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" /><polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" /></svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
          <span style={{ ...B, fontSize: 11, color: 'var(--orange)', letterSpacing: 2, textTransform: 'uppercase' }}>12-Test Protocol</span>
        </div>
        <a href={`/dashboard/coach/clients/${clientId}`} style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Terug</a>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: 'var(--dark2)', minHeight: 'calc(100vh - 64px)', padding: '16px 0', flexShrink: 0, borderRight: '1px solid rgba(212,168,87,0.08)' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', background: active === s.id ? 'rgba(212,168,87,0.1)' : 'none', borderLeft: `3px solid ${active === s.id ? 'var(--orange)' : 'transparent'}`, color: active === s.id ? 'var(--text)' : 'var(--muted)', ...B, fontSize: 12, border: 'none', borderLeft: `3px solid ${active === s.id ? 'var(--orange)' : 'transparent'}`, cursor: 'pointer', lineHeight: 1.4 }}>
              {s.label}
            </button>
          ))}
          {/* Live scores */}
          <div style={{ padding: '12px 16px', marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['Mobility',dl1rm ? null : mobilityScore > 0 ? `${mobilityScore}/10` : null, 'mobility', mobilityScore],
              ['Broad Jump', f.broad_jump_cm ? `${f.broad_jump_cm}cm` : null, 'broad_jump', parseFloat(f.broad_jump_cm)],
              ['DL 1RM', dl1rm ? `${dl1rm}kg` : null, 'deadlift_1rm', dl1rm],
              ['Bench 1RM', bp1rm ? `${bp1rm}kg` : null, 'bench_1rm', bp1rm],
              ['Pull-ups', f.pullup_max ? `${f.pullup_max}` : null, 'pullup_max', parseInt(f.pullup_max)],
              ['1500m', loop_total > 0 ? `${f.loop_min}:${(f.loop_sec||'0').padStart(2,'0')}` : null, 'loop_1500m', loop_total],
            ].map(([label, val, norm, rawVal]) => val ? (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ ...D, fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>{val}</span>
                  <LevelBadge level={getLevel(norm, rawVal)} />
                </div>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 780 }}>

          {active === 'meta' && wrap(<>
            <SH title="TESTGEGEVENS" sub="Vul de basisgegevens in voordat je begint." />
            {grid3(<>
              <div><label style={lbl}>Testdatum</label><input type="date" value={f.test_date} onChange={e=>set('test_date',e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Type meting</label><select value={f.test_type} onChange={e=>set('test_type',e.target.value)} style={inp}><option value="intake">0-meting (Intake)</option><option value="progress">Voortgangsmeting</option><option value="final">Eindmeting</option></select></div>
              <FV label="Leeftijd" name="leeftijd" unit="jaar" placeholder="28" />
            </>)}
            <div style={{ height: 16 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['man','vrouw'].map(v => <button key={v} onClick={()=>set('geslacht',v)} style={{ background: f.geslacht===v ? 'var(--orange)' : 'var(--dark3)', color: f.geslacht===v ? '#000' : 'var(--text)', ...B, fontWeight: 700, fontSize: 13, padding: '10px 24px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>)}
              <select value={f.functiecluster} onChange={e=>set('functiecluster',e.target.value)} style={{ ...inp, width: 'auto' }}><option value="1-3">FC 1–3</option><option value="4-6">FC 4–6</option><option value="nvt">N.v.t.</option></select>
            </div>
            {grid3(<>
              <FV label="Gewicht" name="weight_kg" unit="kg" placeholder="85.5" />
              <FV label="Lengte" name="height_cm" unit="cm" placeholder="185" />
              <FV label="Vetpercentage" name="body_fat_pct" unit="%" placeholder="15.0" />
            </>)}
            <div style={{ marginTop: 16 }}>
              <label style={lbl}>Blessure aanwezig?</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>{['nee','ja'].map(v => <button key={v} onClick={()=>set('blessure',v)} style={{ background: f.blessure===v ? 'var(--orange)' : 'var(--dark3)', color: f.blessure===v ? '#000' : 'var(--text)', ...B, fontWeight: 700, fontSize: 13, padding: '8px 24px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>{v.toUpperCase()}</button>)}</div>
              {f.blessure === 'ja' && <textarea placeholder="Omschrijving blessure..." rows={3} value={f.blessure_omschrijving} onChange={e=>set('blessure_omschrijving',e.target.value)} style={{ ...inp, resize: 'vertical' }} />}
            </div>
          </>)}

          {active === 'warmup' && wrap(<>
            <SH title="WARMING-UP (15 MIN)" />
            {[['🚶 Lichte cardio','5 min @ ~50% hartslag — wandelen, roeien of fietsen'],['⭕ Gewrichten','Heuprotaties 10×, schouderrotaties 10×, ankle circles 10×'],['💪 McGill Big 3','Bird dog 3×8 | Curl-up 3×8 | Side plank 3×20 sec']].map(([t,d]) => (
              <div key={t} style={{ background: 'var(--dark3)', padding: '12px 16px', marginBottom: 8, display: 'flex', gap: 16 }}>
                <div style={{ ...D, fontSize: 14, fontWeight: 700, minWidth: 150 }}>{t}</div>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </>)}

          {active === 'mobility' && wrap(<>
            <SH title="TEST 1 — MOBILITY SCREEN" sub="5 checks. Elke check: 🔴 Beperkt = 0pt | 🟡 Matig = 1pt | 🟢 Goed = 2pt. Max: 10/10" />
            <Mob id="mob_a" label="A — Overhead Deep Squat" desc="Voeten schouderbreed, armen volledig omhoog. Squat diep. 🟢 Armen omhoog, knieën over teen, geen hielstijging | 🟡 Lichte comp. | 🔴 Significant" />
            <Mob id="mob_b" label="B — Shoulder Reach (Apley)" desc="Handen naar midden rug vanuit boven en onder. 🟢 <5cm gap | 🟡 5–10cm | 🔴 >10cm of pijn" />
            <Mob id="mob_c" label="C — Hip 90/90" desc="Beide benen 90° op grond. Rechtop zonder handen. 🟢 Comfortabel beide kanten | 🟡 Lichte beperking | 🔴 Pijn" />
            <Mob id="mob_d" label="D — Thoracale Rotatie" desc="Zit op grond, benen gestrekt, armen over borst. Roteer L/R. 🟢 ≥45° | 🟡 30–45° | 🔴 <30° of asymmetrie" />
            <Mob id="mob_e" label="E — Active Straight Leg Raise" desc="Lig op rug, hef been gestrekt omhoog. 🟢 ≥70° | 🟡 45–70° | 🔴 <45°" />
            <Res value={mobilityScore > 0 ? mobilityScore : null} label="Totaalscore Mobility" normKey="mobility" />
            {mobilityScore > 0 && <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--dark3)', ...B, fontSize: 13, color: 'var(--muted)' }}>{mobilityScore >= 8 ? '✅ Goede mobiliteit' : mobilityScore >= 5 ? '⚠️ Functioneel maar limiterend — gerichte mobiliteitsoefeningen aanbevolen' : '🚨 Significante beperkingen — prioriteer mobiliteit'}</div>}
          </>)}

          {active === 'broad' && wrap(<>
            <SH title="TEST 2 — BROAD JUMP" sub="Explosieve heup-extensie. 3 pogingen — beste afstand." />
            {info('Sta achter de lijn, armen achteruit, explosief springen, armen meeswaaien. Land op beide voeten gelijktijdig. Meting van hiel tot startlijn.')}
            {grid2(<><FV label="Beste sprong" name="broad_jump_cm" unit="cm" placeholder="210" hint="Afgerond op 1 cm" /><div /></>)}
            <Res value={f.broad_jump_cm} label="Broad Jump" normKey="broad_jump" unit=" cm" />
          </>)}

          {active === 'deadlift' && wrap(<>
            <SH title="TEST 3 — HEXBAR DEADLIFT 1-5RM" sub="Maximale kracht lower body. Hexbar verplicht." />
            <Sets sets={[{label:'Opwarmen 1 (6 reps)',kgKey:'dl_w1_kg',repsKey:'dl_w1_reps',isTest:false},{label:'Opwarmen 2 (3 reps)',kgKey:'dl_w2_kg',repsKey:'dl_w2_reps',isTest:false},{label:'★ TESTSET (1-10 reps)',kgKey:'dl_test_kg',repsKey:'dl_test_reps',isTest:true}]} />
            {info('AMF regel: 0 reps → -7/10kg | 1–5 reps ✓ GELDIG | 6–7 reps → +5/7.5kg | 8+ reps → +7.5/10kg. Rust 3–5 min.')}
            <Res value={dl1rm} label="Hexbar DL 1RM (Epley)" normKey="deadlift_1rm" unit=" kg" />
          </>)}

          {active === 'bench' && wrap(<>
            <SH title="TEST 4 — BENCH PRESS 1-5RM" sub="Maximale kracht upper body push. Spotter verplicht." />
            <Sets sets={[{label:'Opwarmen 1 (6 reps)',kgKey:'bp_w1_kg',repsKey:'bp_w1_reps',isTest:false},{label:'Opwarmen 2 (3 reps)',kgKey:'bp_w2_kg',repsKey:'bp_w2_reps',isTest:false},{label:'★ TESTSET (1-10 reps)',kgKey:'bp_test_kg',repsKey:'bp_test_reps',isTest:true}]} />
            {info('Zelfde aanpassingsregel als deadlift. Rug plat op bank, voeten op grond, balk naar onderborst.')}
            <Res value={bp1rm} label="Bench Press 1RM (Epley)" normKey="bench_1rm" unit=" kg" />
          </>)}

          {active === 'illinois' && wrap(<>
            <SH title="TEST 5 — ILLINOIS AGILITY TEST" sub="Richtingswisselsnelheid. 2 pogingen — beste tijd." />
            {info('Start op buik → opstaan → sprint 10m → omdraaien pion → slalom 4 pionnen → omdraaien pion → sprint 10m finish. Pion omschoppen = poging ongeldig. FLETC norm 30–34j: ≤16.70 sec minimum.')}
            {grid2(<><FV label="Beste tijd" name="illinois_sec" unit="sec" placeholder="15.50" hint="2 decimalen, bijv. 15.50" /><div /></>)}
            <Res value={f.illinois_sec} label="Illinois Agility" normKey="illinois" unit=" sec" />
          </>)}

          {active === 'pullup' && wrap(<>
            <SH title="TEST 6 — MAX STRICT PULL-UPS" sub="Overhand greep, dood hang start, kin boven stang. Geen kipping." />
            {info('Startpositie: volledig uitgehangen. Trek tot kin boven stang. Gecontroleerde neerlating. Test eindigt bij eerste onvolledige herhaling.')}
            {grid2(<><FV label="Aantal herhalingen" name="pullup_max" unit="reps" placeholder="12" /><div /></>)}
            <Res value={f.pullup_max} label="Max Strict Pull-ups" normKey="pullup_max" unit=" reps" />
          </>)}

          {active === 'bench_bw' && wrap(<>
            <SH title="TEST 7 — BENCH PRESS @ LICHAAMSGEWICHT" sub={`Kracht-uithoudingsvermogen. Gewicht = lichaamsgewicht${f.weight_kg ? ` ≈ ${Math.round(parseFloat(f.weight_kg)/2.5)*2.5}kg` : ''}. Min. 10 min rust na pull-ups.`} />
            {info('Zelfde techniek als test 4. Max herhalingen non-stop. Stop bij technisch falen. Spotter verplicht.')}
            {grid2(<><FV label="Aantal herhalingen" name="bp_bw_reps" unit="reps" placeholder="15" /><div /></>)}
            <Res value={f.bp_bw_reps} label="Bench @ Lichaamsgewicht" normKey="bp_bw_reps" unit=" reps" />
          </>)}

          {active === 'dedhang' && wrap(<>
            <SH title="TEST 8 — DEAD HANG HOLD" sub="Grip uithoudingsvermogen." />
            {info('Overhand grip, voeten vrij van de grond. Houd zo lang mogelijk. Test eindigt wanneer één of beide handen loslaten.')}
            {grid2(<><TimeIn label="Tijd vastgehouden" minKey="dead_hang_min" secKey="dead_hang_sec" /><div /></>)}
            {dead_hang_total > 0 && <Res value={dead_hang_total} label="Dead Hang (sec)" normKey="dead_hang_sec" unit=" sec" />}
          </>)}

          {active === 'plank' && wrap(<>
            <SH title="TEST 9 — PLANK HOLD" sub="Core uithoudingsvermogen. GBRS minimum: 2:00 min." />
            {info('Prone plank op onderarmen. Ellebogen onder schouders. Lichaam in rechte lijn. Test eindigt bij eerste zichtbare vormbreuk.')}
            {grid2(<><TimeIn label="Tijd volgehouden" minKey="plank_min" secKey="plank_sec_f" /><div /></>)}
            {plank_total > 0 && <Res value={plank_total} label="Plank Hold (sec)" normKey="plank_sec" unit=" sec" />}
          </>)}

          {active === 'sprint400' && wrap(<>
            <SH title="TEST 10 — 400M SPRINT" sub="Anaerobe glycolytische capaciteit. Min. 15 min rust daarna." />
            {info('400m maximale inspanning. Staande start. Noteer tijd in seconden. Garmin aan voor gemiddelde hartslag.')}
            {grid2(<><FV label="Eindtijd (sec totaal)" name="sprint_400m_sec" unit="sec" placeholder="65" /><div /></>)}
            <Res value={f.sprint_400m_sec} label="400m Sprint" normKey="sprint_400m" unit=" sec" />
          </>)}

          {active === 'run1500' && wrap(<>
            <SH title="TEST 11 — 1500M RUN" sub="Aerobe capaciteit. Na minimaal 15 min rust na 400m." />
            {grid2(<>
              <TimeIn label="Eindtijd" minKey="loop_min" secKey="loop_sec" hint="Noteer ook hartslag via Garmin" />
              <FV label="Gemiddelde hartslag" name="resting_hr" unit="bpm" placeholder="165" hint="Optioneel" />
            </>)}
            {loop_total > 0 && <>
              <Res value={loop_total} label="1500m Run (sec)" normKey="loop_1500m" />
              {mas && <div style={{ background: 'var(--dark3)', padding: 16, marginTop: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>MAS</div><div style={{ ...D, fontSize: 24, fontWeight: 700, color: masInfo?.color }}>{mas} m/s</div><div style={{ ...B, fontSize: 11, color: masInfo?.color }}>{masInfo?.level}</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>LSD Tempo (70%)</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{(parseFloat(mas)*0.70).toFixed(2)} m/s</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Interval 90% / 4min</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{Math.round(240*parseFloat(mas)*0.90)} m</div></div>
                </div>
              </div>}
            </>}
          </>)}

          {active === 'looptesten' && wrap(<>
            <SH title="LOOPTESTEN" sub="Kies één of meerdere tests. Alles is optioneel. Auto-berekening van snelheid, tempo en trainingszones." />
            {info('Op basis van de beste MAS meting worden trainingszones berekend. Gebruik bij voorkeur de Cooper test (meest standaard) of de 6-min veldtest.')}

            {/* Cooper 12 min test */}
            <div style={{ background: 'var(--dark3)', padding: 16, marginBottom: 8 }}>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>Cooper Test — 12 minuten</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Ren 12 minuten zo ver mogelijk (bij voorkeur op atletiekbaan). Noteer de totale afstand.</div>
              {grid2(<><FV label="Afstand (meter)" name="cooper_12min_m" unit="m" placeholder="2800" hint="Inclusief laatste rondje exact meten" /><div /></>)}
              {cooper_mas && <div style={{ background: 'var(--dark4)', padding: 12, marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>MAS</div><div style={{ ...D, fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{cooper_mas} m/s</div><div style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{(parseFloat(cooper_mas)*3.6).toFixed(1)} km/h</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>VO2max (schatting)</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{cooper_vo2max}</div><div style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>ml/kg/min</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>4min interval (90%)</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{Math.round(240*parseFloat(cooper_mas)*0.90)} m</div></div>
                </div>
              </div>}
            </div>

            {/* MAS 6 min veldtest */}
            <div style={{ background: 'var(--dark3)', padding: 16, marginBottom: 8 }}>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>MAS Veldtest — 6 minuten</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Ren 6 minuten maximaal. Afstand / 360 = MAS in m/s. Hoge correlatie met laboratorium (r=0.94).</div>
              {grid2(<><FV label="Afstand (meter)" name="mas_6min_m" unit="m" placeholder="1350" hint="Exact meten op atletiekbaan of GPS horloge" /><div /></>)}
              {mas_6min && <div style={{ background: 'var(--dark4)', padding: 12, marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>MAS</div><div style={{ ...D, fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{mas_6min} m/s</div><div style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{(parseFloat(mas_6min)*3.6).toFixed(1)} km/h</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>LSD Tempo (70%)</div><div style={{ ...D, fontSize: 20, fontWeight: 700 }}>{(parseFloat(mas_6min)*0.70).toFixed(2)} m/s</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>4min interval (90%)</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{Math.round(240*parseFloat(mas_6min)*0.90)} m</div></div>
                </div>
              </div>}
            </div>

            {/* 5km tijdrit */}
            <div style={{ background: 'var(--dark3)', padding: 16, marginBottom: 8 }}>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>5km Tijdrit</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Max inspanning over 5 kilometer.</div>
              {grid2(<><TimeIn label="Eindtijd" minKey="run_5km_min" secKey="run_5km_sec_f" /><div /></>)}
              {run5km_speed && <div style={{ background: 'var(--dark4)', padding: 12, marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Snelheid</div><div style={{ ...D, fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{run5km_speed} km/h</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Pace</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{run5km_pace} /km</div></div>
                </div>
              </div>}
            </div>

            {/* 10km tijdrit */}
            <div style={{ background: 'var(--dark3)', padding: 16, marginBottom: 8 }}>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>10km Tijdrit</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Max inspanning over 10 kilometer.</div>
              {grid2(<><TimeIn label="Eindtijd" minKey="run_10km_min" secKey="run_10km_sec_f" /><div /></>)}
              {run10km_speed && <div style={{ background: 'var(--dark4)', padding: 12, marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Snelheid</div><div style={{ ...D, fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{run10km_speed} km/h</div></div>
                  <div><div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Pace</div><div style={{ ...D, fontSize: 22, fontWeight: 700 }}>{run10km_pace} /km</div></div>
                </div>
              </div>}
            </div>

            {/* Trainingszones op basis van beste MAS */}
            {masZones && <div style={{ background: '#0d1f3c', border: '1px solid rgba(212,168,87,0.2)', padding: 16, marginTop: 8 }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 12 }}>Trainingszones op basis van MAS {best_mas} m/s ({(parseFloat(best_mas)*3.6).toFixed(1)} km/h)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {masZones.map(z => {
                  const speedMs = parseFloat(best_mas) * z.pct
                  const secPerKm = 1000 / speedMs
                  const pace = `\${Math.floor(secPerKm/60)}:\${String(Math.round(secPerKm%60)).padStart(2,'0')}`
                  const intervalDist = z.pct >= 0.90 ? Math.round(240 * speedMs) : null
                  return <div key={z.zone} style={{ display: 'grid', gridTemplateColumns: '160px 80px 90px 1fr', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ ...D, fontSize: 13, fontWeight: 700 }}>{z.zone}</div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--orange)' }}>{z.kmh} km/h</div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>{pace} /km</div>
                    {intervalDist && <div style={{ ...B, fontSize: 11, color: '#38e8e8' }}>→ 4min interval: {intervalDist}m</div>}
                  </div>
                })}
              </div>
            </div>}
          </>)}

          {active === 'carry' && wrap(<>
            <SH title="TEST 12 — FARMER'S CARRY" sub={`½ lichaamsgewicht per hand${f.weight_kg ? ` = ${Math.round(parseFloat(f.weight_kg)/2)}kg per hand` : ''}. Min. 10 min rust na 1500m.`} />
            {info('Rechtop lopen, schouders neutraal. Max afstand voor neerleggen. GBRS minimum: 53m. Alternatief: 100m for time (noteer seconden).')}
            {grid2(<><FV label="Afstand" name="farmers_carry_m" unit="meter" placeholder="150" hint="Max afstand tot neerleggen" /><div /></>)}
            <Res value={f.farmers_carry_m} label="Farmer's Carry" normKey="farmers_carry" unit=" m" />
          </>)}

          {active === 'overzicht' && wrap(<>
            <SH title="TESTOVERZICHT" sub="Alle ingevulde resultaten met normering." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                ['Mobility Score', mobilityScore > 0 ? mobilityScore : null, 'mobility'],
                ['Broad Jump (cm)', f.broad_jump_cm ? parseFloat(f.broad_jump_cm) : null, 'broad_jump'],
                ['Hexbar DL 1RM (kg)', dl1rm, 'deadlift_1rm'],
                ['Bench 1RM (kg)', bp1rm, 'bench_1rm'],
                ['Illinois (sec)', f.illinois_sec ? parseFloat(f.illinois_sec) : null, 'illinois'],
                ['Max Pull-ups', f.pullup_max ? parseInt(f.pullup_max) : null, 'pullup_max'],
                ['Bench @ BW (reps)', f.bp_bw_reps ? parseInt(f.bp_bw_reps) : null, 'bp_bw_reps'],
                ['Dead Hang (sec)', dead_hang_total || null, 'dead_hang_sec'],
                ['Plank (sec)', plank_total || null, 'plank_sec'],
                ['400m Sprint (sec)', f.sprint_400m_sec ? parseFloat(f.sprint_400m_sec) : null, 'sprint_400m'],
                ['1500m (sec)', loop_total || null, 'loop_1500m'],
                ["Farmer's Carry (m)", f.farmers_carry_m ? parseFloat(f.farmers_carry_m) : null, 'farmers_carry'],
              ].map(([label, val, norm]) => (
                <div key={label} style={{ background: 'var(--dark3)', padding: '14px 16px' }}>
                  <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  {val ? <>
                    <div style={{ ...D, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{val}</div>
                    <LevelBadge level={getLevel(norm, val)} />
                  </> : <div style={{ ...B, fontSize: 13, color: 'var(--dark4)' }}>Niet ingevuld</div>}
                </div>
              ))}
            </div>
            {mas && <div style={{ marginTop: 8, background: 'rgba(212,168,87,0.07)', border: '1px solid rgba(212,168,87,0.2)', padding: '14px 16px' }}>
              <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 4 }}>MAS Berekening</div>
              <div style={{ ...D, fontSize: 20, fontWeight: 700 }}>{mas} m/s — {masInfo?.level}</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>LSD: {(parseFloat(mas)*0.7).toFixed(2)} m/s | Interval 90%/4min: {Math.round(240*parseFloat(mas)*0.9)}m</div>
            </div>}
          </>)}

          {status === 'error' && <div style={{ ...B, fontSize: 13, color: '#ff6b6b', padding: '12px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', marginTop: 16 }}>Er ging iets mis. Probeer opnieuw.</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {navIdx > 0 && <button onClick={()=>setActive(SECTIONS[navIdx-1].id)} style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 20px', background: 'none', cursor: 'pointer' }}>← {SECTIONS[navIdx-1].short}</button>}
              {navIdx < SECTIONS.length-1 && <button onClick={()=>setActive(SECTIONS[navIdx+1].id)} style={{ background: 'var(--dark2)', color: 'var(--text)', ...B, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 20px', border: 'none', cursor: 'pointer' }}>{SECTIONS[navIdx+1].short} →</button>}
            </div>
            <button onClick={handleSave} disabled={status==='loading'} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 32px', border: 'none', cursor: 'pointer' }}>
              {status==='loading' ? 'OPSLAAN...' : '✓ TEST OPSLAAN'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
