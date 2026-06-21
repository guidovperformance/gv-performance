import CopyButton from '../CopyButton'
import DeleteTestButton from '../DeleteTestButton'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const LEVEL_COLORS = { PRO: '#a855f7', ELITE: '#f87171', GOOD: '#fb923c', STANDARD: '#4ade80', BELOW: '#6b7280' }

const NORMS = {
  mobility_score:  { standard: 5,    good: 7,    elite: 8,    pro: 10,   higher: true,  label: 'Mobility Screen',         unit: '/10'   },
  broad_jump_cm:   { standard: 190,  good: 210,  elite: 230,  pro: 250,  higher: true,  label: 'Broad Jump',              unit: ' cm'   },
  deadlift_1rm:    { standard: 120,  good: 150,  elite: 180,  pro: 200,  higher: true,  label: 'Hexbar DL 1RM',           unit: ' kg'   },
  bench_1rm:       { standard: 70,   good: 90,   elite: 110,  pro: 130,  higher: true,  label: 'Bench Press 1RM',         unit: ' kg'   },
  illinois_sec:    { standard: 17.0, good: 16.0, elite: 15.0, pro: 14.5, higher: false, label: 'Illinois Agility',        unit: ' sec'  },
  pullup_max:      { standard: 8,    good: 12,   elite: 16,   pro: 20,   higher: true,  label: 'Max Pull-ups',            unit: ' reps' },
  bp_bw_reps:      { standard: 10,   good: 15,   elite: 18,   pro: 20,   higher: true,  label: 'Bench @ Lichaamsgewicht', unit: ' reps' },
  dead_hang_sec:   { standard: 30,   good: 60,   elite: 90,   pro: 120,  higher: true,  label: 'Dead Hang Hold',          unit: ' sec', format: 'time' },
  plank_sec:       { standard: 60,   good: 120,  elite: 180,  pro: 300,  higher: true,  label: 'Plank Hold',              unit: ' sec', format: 'time' },
  sprint_400m_sec: { standard: 75,   good: 65,   elite: 58,   pro: 52,   higher: false, label: '400m Sprint',             unit: ' sec'  },
  loop_1500m_sec:  { standard: 360,  good: 330,  elite: 300,  pro: 270,  higher: false, label: '1500m Run',               unit: ' sec', format: 'time' },
  farmers_carry_m: { standard: 50,   good: 100,  elite: 200,  pro: 400,  higher: true,  label: "Farmer's Carry",          unit: ' m'    },
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

function fmtTime(sec) {
  if (!sec) return null
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function Badge({ level }) {
  if (!level) return null
  const color = LEVEL_COLORS[level] || '#6b7280'
  return (
    <span style={{ background: color + '22', color, border: `1px solid ${color}44`, fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '3px 10px', textTransform: 'uppercase' }}>
      {level}
    </span>
  )
}

function MetricCard({ normKey, value }) {
  if (!value && value !== 0) return null
  const n = NORMS[normKey]
  if (!n) return null
  const level = getLevel(normKey, value)
  const color = LEVEL_COLORS[level] || '#6b7280'
  const displayVal = n.format === 'time' ? fmtTime(value) : `${value}${n.unit}`
  const pct = (() => {
    const levels = ['BELOW', 'STANDARD', 'GOOD', 'ELITE', 'PRO']
    return Math.min(100, Math.max(5, (levels.indexOf(level) / 4) * 100))
  })()

  return (
    <div style={{ background: 'var(--dark3)', padding: '20px 18px' }}>
      <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{n.label}</div>
      <div style={{ ...D, fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{displayVal}</div>
      <Badge level={level} />
      <div style={{ marginTop: 10, height: 4, background: 'var(--dark4)', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...B, fontSize: 8, color: 'var(--muted2)', marginTop: 3 }}>
        <span>S:{n.standard}</span><span>G:{n.good}</span><span>E:{n.elite}</span><span>P:{n.pro}</span>
      </div>
    </div>
  )
}

export default async function TestDetail({ params }) {
  const resolvedParams = await params
  const { id, testId } = resolvedParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: test } = await supabaseAdmin
    .from('test_results')
    .select('*')
    .eq('id', testId)
    .single()

  if (!test) redirect(`/dashboard/coach/clients/${id}/test`)

  const { data: client } = await supabaseAdmin
    .from('client_profiles')
    .select('*, profiles!client_profiles_user_id_fkey(full_name)')
    .eq('id', id)
    .single()

  const naam = client?.profiles?.full_name || 'Onbekend'
  const mas = test.mas || (test.loop_1500m_sec ? (1500 / test.loop_1500m_sec).toFixed(2) : null)

  const fmtT = (s) => { if (!s) return '—'; return `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}` }
  const datum = new Date(test.test_date).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' })
  const clipText = [
    `GV Performance — Testresultaat ${naam}`,
    `Datum: ${datum}`,
    `Type: ${test.test_type || 'AMF Protocol'}`,
    '',
    `Mobility Score: ${test.mobility_score ?? '—'}/10`,
    `Broad Jump: ${test.broad_jump_cm ?? '—'} cm`,
    `Hexbar DL 1RM: ${test.deadlift_1rm ?? '—'} kg`,
    `Bench Press 1RM: ${test.bench_1rm ?? '—'} kg`,
    `Illinois Agility: ${test.illinois_sec ?? '—'} sec`,
    `Max Pull-ups: ${test.pullup_max ?? '—'} reps`,
    `Bench @ BW: ${test.bp_bw_reps ?? '—'} reps`,
    `Dead Hang: ${fmtT(test.dead_hang_sec)}`,
    `Plank Hold: ${fmtT(test.plank_sec)}`,
    `400m Sprint: ${test.sprint_400m_sec ?? '—'} sec`,
    `1500m Loop: ${fmtT(test.loop_1500m_sec)}`,
    `Farmer's Carry: ${test.farmers_carry_m ?? '—'} m`,
    mas ? `MAS: ${mas} m/s` : null,
    mas ? `Intervalafstand (90% / 4min): ${Math.round(240 * parseFloat(mas) * 0.90)} m` : null,
    test.notes ? `Notities: ${test.notes}` : null,
  ].filter(Boolean).join('\n')


  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(212,168,87,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857" />
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={`/dashboard/coach/clients/${id}/test`} style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Alle testen</a>
          <CopyButton text={clipText} label="📋 Kopieer test" />
          <a href={`/dashboard/coach/clients/${id}/test/new`} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 18px', textDecoration: 'none' }}>+ Nieuwe test</a>
          <DeleteTestButton testId={testId} clientId={id} />
        </div>
      </header>

      <main style={{ padding: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 8 }}>
            {naam} · {test.test_type === 'intake' ? '0-meting' : test.test_type === 'progress' ? 'Voortgangsmeting' : 'Eindmeting'}
          </div>
          <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
            {new Date(test.test_date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {test.geslacht && <span style={{ ...B, fontSize: 13, color: 'var(--muted)', textTransform: 'capitalize' }}>{test.geslacht}</span>}
            {test.leeftijd && <span style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>{test.leeftijd} jaar</span>}
            {test.functiecluster && test.functiecluster !== 'nvt' && <span style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>FC {test.functiecluster}</span>}
            {test.blessure_aanwezig && <span style={{ ...B, fontSize: 13, color: '#fb923c' }}>⚠️ Blessure: {test.blessure_omschrijving}</span>}
          </div>
        </div>

        {/* Antropometrie */}
        {(test.weight_kg || test.height_cm || test.body_fat_pct) && (
          <div style={{ background: 'var(--dark2)', padding: 24, marginBottom: 2 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14 }}>Antropometrie</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {test.weight_kg && <div><div style={lbl2}>Gewicht</div><div style={{ ...D, fontSize: 24, fontWeight: 700 }}>{test.weight_kg} kg</div></div>}
              {test.height_cm && <div><div style={lbl2}>Lengte</div><div style={{ ...D, fontSize: 24, fontWeight: 700 }}>{test.height_cm} cm</div></div>}
              {test.body_fat_pct && <div><div style={lbl2}>Vetpercentage</div><div style={{ ...D, fontSize: 24, fontWeight: 700 }}>{test.body_fat_pct}%</div></div>}
              {test.weight_kg && test.height_cm && <div><div style={lbl2}>BMI</div><div style={{ ...D, fontSize: 24, fontWeight: 700 }}>{(test.weight_kg / Math.pow(test.height_cm / 100, 2)).toFixed(1)}</div></div>}
              {test.resting_hr && <div><div style={lbl2}>Rusthartslag</div><div style={{ ...D, fontSize: 24, fontWeight: 700 }}>{test.resting_hr} bpm</div></div>}
            </div>
          </div>
        )}

        {/* Test resultaten grid */}
        <div style={{ marginBottom: 2 }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', margin: '20px 0 12px' }}>Testresultaten</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            <MetricCard normKey="mobility_score" value={test.mobility_score} />
            <MetricCard normKey="broad_jump_cm" value={test.broad_jump_cm} />
            <MetricCard normKey="deadlift_1rm" value={test.deadlift_1rm} />
            <MetricCard normKey="bench_1rm" value={test.bench_1rm} />
            <MetricCard normKey="illinois_sec" value={test.illinois_sec} />
            <MetricCard normKey="pullup_max" value={test.pullup_max} />
            <MetricCard normKey="bp_bw_reps" value={test.bp_bw_reps} />
            <MetricCard normKey="dead_hang_sec" value={test.dead_hang_sec} />
            <MetricCard normKey="plank_sec" value={test.plank_sec} />
            <MetricCard normKey="sprint_400m_sec" value={test.sprint_400m_sec} />
            <MetricCard normKey="loop_1500m_sec" value={test.loop_1500m_sec} />
            <MetricCard normKey="farmers_carry_m" value={test.farmers_carry_m} />
          </div>
        </div>

        {/* MAS berekening */}
        {mas && (
          <div style={{ background: 'var(--dark2)', padding: 24, marginTop: 2 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14 }}>MAS Berekening (uit 1500m)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                ['MAS', `${mas} m/s`, parseFloat(mas) > 4.96 ? 'Elite' : parseFloat(mas) >= 3.90 ? 'Gevorderd' : parseFloat(mas) >= 2.85 ? 'Gemiddeld' : 'Beginner'],
                ['LSD Tempo (70%)', `${(parseFloat(mas) * 0.70).toFixed(2)} m/s`, ''],
                ['Interval 90%/4min', `${Math.round(240 * parseFloat(mas) * 0.90)} m`, ''],
                ['1500m Tijd', fmtTime(test.loop_1500m_sec), ''],
              ].map(([label, val, sub]) => (
                <div key={label}>
                  <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  <div style={{ ...D, fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>{val}</div>
                  {sub && <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Werksets detail */}
        {(test.bench_werkset_kg || test.deadlift_werkset_kg) && (
          <div style={{ background: 'var(--dark2)', padding: 24, marginTop: 2 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 14 }}>Werkset Details</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {test.bench_werkset_kg && <div>
                <div style={lbl2}>Bench Werkset</div>
                <div style={{ ...D, fontSize: 20, fontWeight: 700 }}>{test.bench_werkset_kg}kg × {test.bench_werkset_reps} reps</div>
              </div>}
              {test.deadlift_werkset_kg && <div>
                <div style={lbl2}>Deadlift Werkset</div>
                <div style={{ ...D, fontSize: 20, fontWeight: 700 }}>{test.deadlift_werkset_kg}kg × {test.deadlift_werkset_reps} reps</div>
              </div>}
            </div>
          </div>
        )}

        {/* Notities */}
        {test.notes && (
          <div style={{ background: 'var(--dark2)', padding: 24, marginTop: 2 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 10 }}>Notities</div>
            <div style={{ ...B, fontSize: 14, color: '#aaa', lineHeight: 1.7 }}>{test.notes}</div>
          </div>
        )}
      </main>
    </div>
  )
}

const lbl2 = { fontFamily: 'var(--font-barlow), sans-serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }
