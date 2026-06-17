import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CopyButton from './CopyButton'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const LEVEL_COLORS = { PRO:'#a855f7', ELITE:'#fb923c', GOOD:'#4ade80', STANDARD:'#60a5fa', BELOW:'#6b7280' }

const METRICS = [
  { key:'mobility_score',  label:'Mobility Score',   unit:'/10'   },
  { key:'broad_jump_cm',   label:'Broad Jump',       unit:' cm'   },
  { key:'deadlift_1rm',    label:'DL 1RM',           unit:' kg'   },
  { key:'bench_1rm',       label:'Bench 1RM',        unit:' kg'   },
  { key:'illinois_sec',    label:'Illinois',         fmt:'time'   },
  { key:'pullup_max',      label:'Pull-ups',         unit:' reps' },
  { key:'bp_bw_reps',      label:'Bench @ BW',       unit:' reps' },
  { key:'dead_hang_sec',   label:'Dead Hang',        fmt:'time'   },
  { key:'plank_sec',       label:'Plank',            fmt:'time'   },
  { key:'sprint_400m_sec', label:'400m Sprint',      fmt:'time'   },
  { key:'loop_1500m_sec',  label:'1500m',            fmt:'time'   },
  { key:'farmers_carry_m', label:"Farmer's Carry",   unit:' m'    },
]

const NORMS = {
  mobility_score:  { s:5,   g:7,   e:8,   p:10,  hi:true  },
  broad_jump_cm:   { s:190, g:210, e:230, p:250, hi:true  },
  deadlift_1rm:    { s:120, g:150, e:180, p:200, hi:true  },
  bench_1rm:       { s:70,  g:90,  e:110, p:130, hi:true  },
  illinois_sec:    { s:17,  g:16,  e:15,  p:14.5,hi:false },
  pullup_max:      { s:8,   g:12,  e:16,  p:20,  hi:true  },
  bp_bw_reps:      { s:10,  g:15,  e:18,  p:20,  hi:true  },
  dead_hang_sec:   { s:30,  g:60,  e:90,  p:120, hi:true  },
  plank_sec:       { s:60,  g:120, e:180, p:300, hi:true  },
  sprint_400m_sec: { s:75,  g:65,  e:58,  p:52,  hi:false },
  loop_1500m_sec:  { s:360, g:330, e:300, p:270, hi:false },
  farmers_carry_m: { s:50,  g:100, e:200, p:400, hi:true  },
}

function fmtTime(sec) {
  if (!sec && sec !== 0) return '—'
  return `${Math.floor(sec/60)}:${String(Math.round(sec%60)).padStart(2,'0')}`
}

function fmtVal(m, val) {
  if (!val && val !== 0) return '—'
  return m.fmt === 'time' ? fmtTime(val) : `${val}${m.unit||''}`
}

function getLevel(key, val) {
  const n = NORMS[key]; if (!n || !val) return null
  const v = parseFloat(val)
  if (n.hi)  return v>=n.p?'PRO':v>=n.e?'ELITE':v>=n.g?'GOOD':v>=n.s?'STANDARD':'BELOW'
  return          v<=n.p?'PRO':v<=n.e?'ELITE':v<=n.g?'GOOD':v<=n.s?'STANDARD':'BELOW'
}

function Badge({ level }) {
  if (!level) return null
  const c = LEVEL_COLORS[level]||'#888'
  return <span style={{ background:c+'22', color:c, border:`1px solid ${c}44`, fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:700, letterSpacing:2, padding:'2px 7px' }}>{level}</span>
}

function Delta({ old: a, new: b, key: k }) {
  if (!a||!b) return null
  const diff = parseFloat(b)-parseFloat(a)
  if (Math.abs(diff)<0.01) return null
  const up = NORMS[k]?.hi ? diff>0 : diff<0
  return <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, color:up?'#4ade80':'#f87171', marginLeft:4 }}>{up?'▲':'▼'}{Math.abs(diff).toFixed(1)}</span>
}

export default async function TestOverview({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabaseAdmin
    .from('client_profiles')
    .select('*, profiles!client_profiles_user_id_fkey(full_name)')
    .eq('id', id).single()
  if (!client) redirect('/dashboard/coach')

  const { data: tests } = await supabaseAdmin
    .from('test_results')
    .select('*')
    .eq('client_id', id)
    .order('test_date', { ascending: true })

  const naam = client.profiles?.full_name || 'Onbekend'
  const allTests = tests || []

  // Klembord tekst voor alle tests
  const clipText = allTests.map((t, i) => {
    const lbl = i===0 ? '0-meting' : i===allTests.length-1 ? 'Eindmeting' : `Meting ${i+1}`
    const datum = new Date(t.test_date).toLocaleDateString('nl-NL')
    const rows = METRICS.map(m => {
      const v = t[m.key]; if (!v&&v!==0) return null
      return `${m.label}: ${fmtVal(m,v)} [${getLevel(m.key,v)||'—'}]`
    }).filter(Boolean).join('\n')
    return `${lbl} — ${datum}\n${rows}`
  }).join('\n\n')

  const fullClip = `GV Performance — Testresultaten ${naam}\n${'─'.repeat(40)}\n\n${clipText}`

  return (
    <div style={{ background:'var(--dark)', minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: '.test-card-link:hover { background: #1e1e1e !important; }' }} />
      <header style={{ background:'var(--dark2)', borderBottom:'1px solid rgba(255,77,0,0.12)', padding:'14px 40px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="22" height="20" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
          </svg>
          <span style={{ ...D, fontSize:16, letterSpacing:3, fontWeight:700, color:'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <a href={`/dashboard/coach/clients/${id}`} style={{ ...B, fontSize:11, letterSpacing:2, color:'var(--muted)', textDecoration:'none', textTransform:'uppercase' }}>← {naam}</a>
      </header>

      <main style={{ padding:'clamp(16px,4vw,40px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:6 }}>Testhistorie</div>
            <h1 style={{ ...D, fontSize:'clamp(24px,4vw,40px)', fontWeight:700, letterSpacing:1, marginBottom:4 }}>{naam.toUpperCase()}</h1>
            <div style={{ ...B, fontSize:14, color:'var(--muted)' }}>{allTests.length} meting{allTests.length!==1?'en':''} opgeslagen</div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {allTests.length > 0 && <CopyButton text={fullClip} label="📋 Kopieer alle tests" />}
            <a href={`/dashboard/coach/clients/${id}/test/new`}
              style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', padding:'10px 20px', textDecoration:'none' }}>
              + Nieuwe test
            </a>
          </div>
        </div>

        {allTests.length === 0 ? (
          <div style={{ background:'var(--dark2)', padding:60, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
            <div style={{ ...D, fontSize:22, fontWeight:700, marginBottom:8 }}>Nog geen testresultaten</div>
            <div style={{ ...B, fontSize:14, color:'var(--muted)', marginBottom:24 }}>Voer de eerste meting in om voortgang bij te houden.</div>
            <a href={`/dashboard/coach/clients/${id}/test/new`}
              style={{ background:'var(--orange)', color:'#000', ...B, fontWeight:700, fontSize:13, letterSpacing:2, textTransform:'uppercase', padding:'14px 32px', textDecoration:'none' }}>
              Test invoeren
            </a>
          </div>
        ) : (
          <>
            {/* Vergelijkingstabel bij 2+ tests */}
            {allTests.length >= 2 && (
              <div style={{ background:'var(--dark2)', padding:24, marginBottom:20, overflowX:'auto' }}>
                <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:16 }}>Voortgang vergelijking</div>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:400 }}>
                  <thead>
                    <tr>
                      <th style={{ ...B, fontSize:10, color:'var(--muted)', textAlign:'left', padding:'6px 12px 10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', letterSpacing:1, textTransform:'uppercase' }}>Metric</th>
                      {allTests.map((t,i) => (
                        <th key={t.id} style={{ ...B, fontSize:10, color:i===allTests.length-1?'var(--orange)':'var(--muted)', textAlign:'center', padding:'6px 8px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', letterSpacing:1, textTransform:'uppercase', whiteSpace:'nowrap' }}>
                          {i===0?'0-meting':i===allTests.length-1?'Laatste':`M${i+1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.map(m => {
                      const hasData = allTests.some(t => t[m.key]!=null)
                      if (!hasData) return null
                      return (
                        <tr key={m.key} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ ...B, fontSize:12, color:'var(--muted)', padding:'8px 12px 8px 0', whiteSpace:'nowrap' }}>{m.label}</td>
                          {allTests.map((t,i) => (
                            <td key={t.id} style={{ textAlign:'center', padding:'8px' }}>
                              <span style={{ ...D, fontSize:14, fontWeight:700, color:i===allTests.length-1?'var(--text)':'var(--muted)' }}>{fmtVal(m,t[m.key])}</span>
                              {i>0 && <Delta old={allTests[0][m.key]} new={t[m.key]} key={m.key} />}
                              {t[m.key]&&<div style={{marginTop:2}}><Badge level={getLevel(m.key,t[m.key])}/></div>}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tijdlijn — elke test is een klikbare kaart */}
            <div style={{ ...B, fontSize:10, letterSpacing:4, color:'var(--orange)', textTransform:'uppercase', marginBottom:12 }}>
              Alle metingen
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[...allTests].reverse().map((test, idx) => {
                const absIdx = allTests.length - 1 - idx
                const isLatest = idx === 0
                const lbl = absIdx===0 ? '0-meting' : absIdx===allTests.length-1 ? 'Eindmeting' : `Meting ${absIdx+1}`
                const datum = new Date(test.test_date).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' })
                return (
                  <a key={test.id}
                    href={`/dashboard/coach/clients/${id}/test/${test.id}`}
                    className="test-card-link"
                    style={{ display:'block', background:'var(--dark2)', borderLeft:`3px solid ${isLatest?'var(--orange)':'var(--dark4)'}`, padding:'18px 22px', textDecoration:'none' }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, gap:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <span style={{ ...D, fontSize:17, fontWeight:700, color:'var(--text)' }}>{datum}</span>
                        <span style={{ ...B, fontSize:10, letterSpacing:2, textTransform:'uppercase', color:isLatest?'var(--orange)':'var(--muted)' }}>{lbl}</span>
                        {test.blessure_aanwezig && <span style={{ ...B, fontSize:10, color:'#fb923c' }}>⚠️ Blessure</span>}
                      </div>
                      <span style={{ ...B, fontSize:12, color:'var(--orange)', fontWeight:700, letterSpacing:1, flexShrink:0 }}>Bekijk →</span>
                    </div>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                      {METRICS.slice(0,6).map(m => {
                        const v = test[m.key]
                        if (!v&&v!==0) return null
                        return (
                          <div key={m.key} style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ ...B, fontSize:11, color:'var(--muted)' }}>{m.label}:</span>
                            <span style={{ ...D, fontSize:13, fontWeight:700, color:'var(--text)' }}>{fmtVal(m,v)}</span>
                            <Badge level={getLevel(m.key,v)} />
                          </div>
                        )
                      })}
                    </div>
                  </a>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
