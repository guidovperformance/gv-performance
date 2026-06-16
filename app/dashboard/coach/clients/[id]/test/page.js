import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const LEVEL_COLORS = { PRO: '#a855f7', ELITE: '#f87171', GOOD: '#fb923c', STANDARD: '#4ade80', BELOW: '#6b7280' }

const NORMS = {
  mobility_score:   { standard: 5,    good: 7,    elite: 8,    pro: 10,   higher: true  },
  broad_jump_cm:    { standard: 190,  good: 210,  elite: 230,  pro: 250,  higher: true  },
  deadlift_1rm:     { standard: 120,  good: 150,  elite: 180,  pro: 200,  higher: true  },
  bench_1rm:        { standard: 70,   good: 90,   elite: 110,  pro: 130,  higher: true  },
  illinois_sec:     { standard: 17.0, good: 16.0, elite: 15.0, pro: 14.5, higher: false },
  pullup_max:       { standard: 8,    good: 12,   elite: 16,   pro: 20,   higher: true  },
  bp_bw_reps:       { standard: 10,   good: 15,   elite: 18,   pro: 20,   higher: true  },
  dead_hang_sec:    { standard: 30,   good: 60,   elite: 90,   pro: 120,  higher: true  },
  plank_sec:        { standard: 60,   good: 120,  elite: 180,  pro: 300,  higher: true  },
  sprint_400m_sec:  { standard: 75,   good: 65,   elite: 58,   pro: 52,   higher: false },
  loop_1500m_sec:   { standard: 360,  good: 330,  elite: 300,  pro: 270,  higher: false },
  farmers_carry_m:  { standard: 50,   good: 100,  elite: 200,  pro: 400,  higher: true  },
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

function Badge({ level }) {
  if (!level) return null
  const color = LEVEL_COLORS[level] || '#6b7280'
  return (
    <span style={{ background: color + '22', color, border: `1px solid ${color}44`, fontFamily: 'var(--font-barlow), sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: '2px 8px' }}>
      {level}
    </span>
  )
}

function fmtTime(sec) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default async function TestOverview({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabaseAdmin
    .from('client_profiles')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single()

  if (!client) redirect('/dashboard/coach')

  const { data: tests } = await supabaseAdmin
    .from('test_results')
    .select('*')
    .eq('client_id', id)
    .order('test_date', { ascending: false })

  const naam = client.profiles?.full_name || 'Onbekend'

  const KEY_METRICS = [
    { key: 'deadlift_1rm', label: 'DL 1RM', unit: 'kg' },
    { key: 'bench_1rm', label: 'Bench 1RM', unit: 'kg' },
    { key: 'pullup_max', label: 'Pull-ups', unit: 'reps' },
    { key: 'loop_1500m_sec', label: '1500m', format: fmtTime },
    { key: 'mobility_score', label: 'Mobility', unit: '/10' },
    { key: 'broad_jump_cm', label: 'Broad Jump', unit: 'cm' },
  ]

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <a href={`/dashboard/coach/clients/${id}`} style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← {naam}</a>
      </header>

      <main style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 8 }}>Testhistorie</div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>{naam.toUpperCase()}</h1>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{tests?.length || 0} metingen opgeslagen</div>
          </div>
          <a href={`/dashboard/coach/clients/${id}/test/new`}
            style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', textDecoration: 'none' }}>
            + Nieuwe test
          </a>
        </div>

        {!tests || tests.length === 0 ? (
          <div style={{ background: 'var(--dark2)', padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ ...D, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Nog geen testresultaten</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Voer de eerste meting in om de voortgang bij te houden.</div>
            <a href={`/dashboard/coach/clients/${id}/test/new`} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '14px 32px', textDecoration: 'none' }}>
              Test invoeren
            </a>
          </div>
        ) : (
          <>
            {/* Progress comparison - if 2+ tests */}
            {tests.length >= 2 && (
              <div style={{ background: 'var(--dark2)', padding: 24, marginBottom: 24 }}>
                <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16 }}>Voortgang — 0-meting vs laatste meting</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
                  {KEY_METRICS.map(({ key, label, unit, format }) => {
                    const first = tests[tests.length - 1][key]
                    const latest = tests[0][key]
                    if (!first && !latest) return null
                    const diff = first && latest ? parseFloat(latest) - parseFloat(first) : null
                    const n = NORMS[key]
                    const improved = diff !== null ? (n?.higher ? diff > 0 : diff < 0) : null
                    return (
                      <div key={key} style={{ background: 'var(--dark3)', padding: '16px 14px', textAlign: 'center' }}>
                        <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                        <div style={{ ...D, fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>
                          {format ? format(latest) : latest ? `${latest}${unit || ''}` : '—'}
                        </div>
                        {diff !== null && Math.abs(diff) > 0 && (
                          <div style={{ ...B, fontSize: 11, color: improved ? '#4ade80' : '#f87171', marginTop: 4 }}>
                            {improved ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}{unit || ''}
                          </div>
                        )}
                        <div style={{ marginTop: 6 }}>
                          <Badge level={getLevel(key, latest)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Test list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tests.map((test, idx) => (
                <a key={test.id} href={`/dashboard/coach/clients/${id}/test/${test.id}`}
                  style={{ background: 'var(--dark2)', padding: '20px 28px', textDecoration: 'none', display: 'block', borderLeft: `3px solid ${idx === 0 ? 'var(--orange)' : 'transparent'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div>
                        <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, color: 'var(--text)' }}>
                          {new Date(test.test_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <span style={{ ...B, fontSize: 11, color: idx === 0 ? 'var(--orange)' : 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
                            {idx === 0 ? '● Laatste meting' : idx === tests.length - 1 ? '○ 0-meting' : `○ Meting ${tests.length - idx}`}
                          </span>
                          <span style={{ ...B, fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{test.test_type}</span>
                          {test.blessure_aanwezig && <span style={{ ...B, fontSize: 11, color: '#fb923c' }}>⚠️ Blessure</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)' }}>Bekijken →</div>
                  </div>

                  {/* Key metrics preview */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {KEY_METRICS.map(({ key, label, unit, format }) => {
                      const val = test[key]
                      if (!val) return null
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{label}:</span>
                          <span style={{ ...D, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                            {format ? format(val) : `${val}${unit || ''}`}
                          </span>
                          <Badge level={getLevel(key, val)} />
                        </div>
                      )
                    })}
                    {test.weight_kg && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>Gewicht:</span>
                        <span style={{ ...D, fontSize: 14, fontWeight: 700 }}>{test.weight_kg} kg</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
