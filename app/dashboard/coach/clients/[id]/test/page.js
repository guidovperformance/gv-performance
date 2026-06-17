import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const LEVEL_COLORS = { PRO:'#a855f7', ELITE:'#fb923c', GOOD:'#4ade80', STANDARD:'#60a5fa', BELOW:'#6b7280' }

const NORMS = {
  mobility_score:  { standard:5,   good:7,   elite:8,   pro:10,  higher:true  },
  broad_jump_cm:   { standard:190, good:210, elite:230, pro:250, higher:true  },
  deadlift_1rm:    { standard:120, good:150, elite:180, pro:200, higher:true  },
  bench_1rm:       { standard:70,  good:90,  elite:110, pro:130, higher:true  },
  illinois_sec:    { standard:17,  good:16,  elite:15,  pro:14.5,higher:false },
  pullup_max:      { standard:8,   good:12,  elite:16,  pro:20,  higher:true  },
  bp_bw_reps:      { standard:10,  good:15,  elite:18,  pro:20,  higher:true  },
  dead_hang_sec:   { standard:30,  good:60,  elite:90,  pro:120, higher:true  },
  plank_sec:       { standard:60,  good:120, elite:180, pro:300, higher:true  },
  sprint_400m_sec: { standard:75,  good:65,  elite:58,  pro:52,  higher:false },
  loop_1500m_sec:  { standard:360, good:330, elite:300, pro:270, higher:false },
  farmers_carry_m: { standard:50,  good:100, elite:200, pro:400, higher:true  },
}

const ALL_METRICS = [
  { key:'mobility_score',  label:'Mobility Score',      unit:'/10'  },
  { key:'broad_jump_cm',   label:'Broad Jump',          unit:'cm'   },
  { key:'deadlift_1rm',    label:'Hexbar DL 1RM',       unit:'kg'   },
  { key:'bench_1rm',       label:'Bench Press 1RM',     unit:'kg'   },
  { key:'illinois_sec',    label:'Illinois Agility',    fmt:'time'  },
  { key:'pullup_max',      label:'Max Pull-ups',        unit:'reps' },
  { key:'bp_bw_reps',      label:'Bench @ BW',          unit:'reps' },
  { key:'dead_hang_sec',   label:'Dead Hang',           fmt:'time'  },
  { key:'plank_sec',       label:'Plank Hold',          fmt:'time'  },
  { key:'sprint_400m_sec', label:'400m Sprint',         fmt:'time'  },
  { key:'loop_1500m_sec',  label:'1500m Loop',          fmt:'time'  },
  { key:'farmers_carry_m', label:"Farmer's Carry",      unit:'m'    },
]

function fmtTime(sec) {
  if (!sec && sec !== 0) return '—'
  const m = Math.floor(sec/60), s = sec%60
  return `${m}:${String(s).padStart(2,'0')}`
}

function fmtVal(metric, val) {
  if (val == null || val === '') return '—'
  if (metric.fmt === 'time') return fmtTime(parseFloat(val))
  return `${val}${metric.unit||''}`
}

function getLevel(key, val) {
  if (!val && val !== 0) return null
  const n = NORMS[key]; if (!n) return null
  const v = parseFloat(val)
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

function LevelBadge({ level }) {
  if (!level) return null
  const c = LEVEL_COLORS[level]||'#888'
  return <span style={{ background:c+'22', color:c, border:`1px solid ${c}44`, fontFamily:'var(--font-barlow), sans-serif', fontSize:9, fontWeight:700, letterSpacing:2, padding:'2px 7px', display:'inline-block' }}>{level}</span>
}

function Delta({ a, b, metric }) {
  if (!a || !b) return null
  const va = parseFloat(a), vb = parseFloat(b)
  const diff = vb - va
  if (Math.abs(diff) < 0.01) return null
  const improved = NORMS[metric.key]?.higher ? diff > 0 : diff < 0
  return (
    <span style={{ fontFamily:'var(--font-barlow), sans-serif', fontSize:10, color:improved?'#4ade80':'#f87171', marginLeft:4 }}>
      {improved?'▲':'▼'}{Math.abs(diff).toFixed(1)}{metric.unit||''}
    </span>
  )
}

// Client component voor klembord kopiëren
function CopyButton({ text, naam }) {
  'use client'
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => alert('Gekopieerd naar klembord! ✅'))
      }}
      style={{ background:'var(--dark3)', border:'1px solid var(--muted2)', color:'var(--text)', fontFamily:'var(--font-barlow), sans-serif', fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', padding:'8px 18px', cursor:'pointer' }}>
      📋 Kopieer alles
    </button>
  )
}

export default async function TestOverview({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabaseAdmin
    .from('client_profiles')
    .select('*, profiles!client_profiles_user_id_fkey(full_name)')
    .eq('id', id)
    .single()
  if (!client) redirect('/dashboard/coach')

  // Alle tests — geen limit — chronologisch
  const { data: tests } = await supabaseAdmin
    .from('test_results')
    .select('*')
    .eq('client_id', id)
    .order('test_date', { ascending: true })

  const naam = client.profiles?.full_name || 'Onbekend'
  const testsDesc = [...(tests||[])].reverse() // nieuwste eerst voor display

  // Genereer klembord tekst
  const clipText = [
    `GV Performance — Testresultaten ${naam}`,
    `Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}`,
    '',
    ...(tests||[]).map((test, i) => {
      const label = i === 0 ? '0-meting' : i === (tests.length-1) ? 'Eindmeting' : `Meting ${i+1}`
      const datum = new Date(test.test_date).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' })
      const rows = ALL_METRICS
        .map(m => {
          const v = test[m.key]
          if (!v && v !== 0) return null
          const lv = getLevel(m.key, v)
          return `  ${m.label}: ${fmtVal(m, v)}${lv ? ` [${lv}]` : ''}`
        })
        .filter(Boolean)
      return [`${label}: ${datum}`, ...rows, ''].join('\n')
    })
  ].join('\n')

  return (
    <div style={{ background:'var(--dark)', minHeight:'100vh', ...B }}>
      <header style={{ background:'var(--dark2)', borderBottom:'1px solid rgba(255,77,0,0.12)', padding:'16px clamp(16px,4vw,40px)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
          </svg>
          <span style={{ ...D, fontSize:18, letterSpacing:3, fontWeight:700, color:'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <a href={`/dashboard/coach/clients/${id}`} style={{ ...B, fontSize:12, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', textDecoration:'none' }}>← {naam}</a>
      </header>

      <main style={{ padding:'clamp(16px,4vw,40px)' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:8 }}>Testhistorie</div>
            <h1 style={{ ...D, fontSize:'clamp(24px,4vw,36px)', fontWeight:700, letterSpacing:1 }}>{naam.toUpperCase()}</h1>
            <div style={{ ...B, fontSize:14, color:'var(--muted)', marginTop:4 }}>
              {tests?.length||0} {tests?.length===1 ? 'meting' : 'metingen'} opgeslagen
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {tests && tests.length > 0 && (
              <CopyButton text={clipText} naam={naam} />
            )}
            <a href={`/dashboard/coach/clients/${id}/test/new`}
              style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', padding:'10px 20px', textDecoration:'none' }}>
              + Nieuwe test
            </a>
          </div>
        </div>

        {!tests || tests.length === 0 ? (
          <div style={{ background:'var(--dark2)', padding:60, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
            <div style={{ ...D, fontSize:24, fontWeight:700, marginBottom:8 }}>Nog geen testresultaten</div>
            <div style={{ ...B, fontSize:14, color:'var(--muted)', marginBottom:28 }}>Voer de eerste meting in om voortgang bij te houden.</div>
            <a href={`/dashboard/coach/clients/${id}/test/new`}
              style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', padding:'14px 32px', textDecoration:'none' }}>
              Test invoeren
            </a>
          </div>
        ) : (<>

          {/* Vergelijkingstabel — 2+ tests */}
          {tests.length >= 2 && (
            <div style={{ background:'var(--dark2)', padding:'20px', marginBottom:24, overflowX:'auto' }}>
              <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:16 }}>
                Voortgang vergelijking
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                <thead>
                  <tr>
                    <th style={{ ...B, fontSize:10, color:'var(--muted)', letterSpacing:1, textTransform:'uppercase', textAlign:'left', padding:'6px 12px 10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>Test</th>
                    {tests.map((t,i) => (
                      <th key={t.id} style={{ ...B, fontSize:10, color:i===tests.length-1 ? 'var(--orange)' : 'var(--muted)', letterSpacing:1, textTransform:'uppercase', textAlign:'center', padding:'6px 8px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>
                        {i === 0 ? '0-meting' : i === tests.length-1 ? 'Laatste' : `M${i+1}`}<br/>
                        <span style={{ fontSize:9, opacity:0.7 }}>{new Date(t.test_date).toLocaleDateString('nl-NL', { day:'numeric', month:'short' })}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_METRICS.map(metric => {
                    const hasAny = tests.some(t => t[metric.key] != null)
                    if (!hasAny) return null
                    return (
                      <tr key={metric.key} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ ...B, fontSize:12, color:'var(--muted)', padding:'7px 12px 7px 0', whiteSpace:'nowrap' }}>{metric.label}</td>
                        {tests.map((t,i) => {
                          const val = t[metric.key]
                          const lvl = getLevel(metric.key, val)
                          const isLast = i === tests.length-1
                          return (
                            <td key={t.id} style={{ textAlign:'center', padding:'7px 8px' }}>
                              <span style={{ ...D, fontSize:14, fontWeight:700, color:isLast ? 'var(--text)' : 'var(--muted)' }}>
                                {fmtVal(metric, val)}
                              </span>
                              {i > 0 && <Delta a={tests[0][metric.key]} b={val} metric={metric} />}
                              {lvl && <div style={{ marginTop:2 }}><LevelBadge level={lvl} /></div>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tijdlijn — alle tests */}
          <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:14 }}>
            Alle metingen ({testsDesc.length})
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {testsDesc.map((test, idx) => {
              const absIdx = tests.length - 1 - idx
              const label = absIdx === 0 ? '0-meting' : absIdx === tests.length-1 ? 'Eindmeting' : `Meting ${absIdx+1}`
              const isLatest = idx === 0
              return (
                <div key={test.id} style={{ background:'var(--dark2)', borderLeft:`3px solid ${isLatest ? 'var(--orange)' : 'var(--dark4)'}` }}>
                  {/* Test header */}
                  <a href={`/dashboard/coach/clients/${id}/test/${test.id}`}
                    style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', textDecoration:'none' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
                        <span style={{ ...D, fontSize:18, fontWeight:700, letterSpacing:1, color:'var(--text)' }}>
                          {new Date(test.test_date).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' })}
                        </span>
                        <span style={{ ...B, fontSize:10, letterSpacing:2, textTransform:'uppercase', color:isLatest ? 'var(--orange)' : 'var(--muted)' }}>
                          {label}
                        </span>
                        {test.blessure_aanwezig && <span style={{ ...B, fontSize:10, color:'#fb923c' }}>⚠️ Blessure</span>}
                      </div>
                      {/* Key metrics preview */}
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        {ALL_METRICS.slice(0,6).map(m => {
                          const val = test[m.key]
                          if (!val && val !== 0) return null
                          return (
                            <div key={m.key} style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <span style={{ ...B, fontSize:11, color:'var(--muted)' }}>{m.label}:</span>
                              <span style={{ ...D, fontSize:13, fontWeight:700 }}>{fmtVal(m,val)}</span>
                              <LevelBadge level={getLevel(m.key, val)} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <span style={{ ...B, fontSize:11, color:'var(--orange)', letterSpacing:2, textTransform:'uppercase', flexShrink:0 }}>Details →</span>
                  </a>
                </div>
              )
            })}
          </div>
        </>)}
      </main>
    </div>
  )
}
