'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

// FIXED: veilige gemiddelde berekening — geen deling door nul
function safeAvg(arr, key) {
  const valid = arr.filter(c => c[key] != null && c[key] > 0)
  if (!valid.length) return '—'
  return (valid.reduce((a, c) => a + parseFloat(c[key]), 0) / valid.length).toFixed(1)
}

function safeMin(arr, key) {
  const valid = arr.filter(c => c[key] != null).map(c => parseFloat(c[key]))
  if (!valid.length) return '—'
  return Math.min(...valid) + ' kg'
}

export default function History() {
  const [checkIns, setCheckIns] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState('checkins')
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
      if (!cp) { setLoading(false); return }

      const { data: ci } = await supabase
        .from('daily_checkins').select('*').eq('client_id', cp.id)
        .order('checkin_date', { ascending: false }).limit(60)

      setCheckIns(ci || [])
      setLoading(false)
    }
    load()
  }, [])

  const ScoreBar = ({ value, max = 5, color = 'var(--orange)' }) => {
    if (!value) return <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>—</span>
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--dark4)', borderRadius: 2, minWidth: 40 }}>
          <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
        </div>
        <span style={{ ...D, fontSize: 13, fontWeight: 700, color, minWidth: 14 }}>{value}</span>
      </div>
    )
  }

  const latestWeight = checkIns.find(c => c.morning_weight)?.morning_weight

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 16, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/client" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Dashboard</a>
      </header>

      <main style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ ...D, fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: 1, marginBottom: 24 }}>MIJN VOORTGANG</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24 }}>
          {[['checkins', '📊 Check-ins'], ['stats', '📈 Statistieken']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ background: tab === key ? 'var(--orange)' : 'var(--dark2)', color: tab === key ? '#000' : 'var(--muted)', ...B, fontWeight: tab === key ? 700 : 400, fontSize: 13, letterSpacing: 1, padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, ...D, fontSize: 20, color: 'var(--orange)' }}>LADEN...</div>
        ) : tab === 'checkins' ? (
          <>
            {checkIns.length === 0 ? (
              <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                <div style={{ ...D, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Nog geen check-ins</div>
                <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Doe je eerste dagelijkse check-in!</div>
                <a href="/dashboard/client/checkin"
                  style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', textDecoration: 'none' }}>
                  Check-in doen
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {checkIns.map(c => (
                  <div key={c.id} style={{ background: 'var(--dark2)', padding: '16px 20px' }}>
                    {/* Datum + gewicht */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ ...D, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                        {new Date(c.checkin_date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      {c.morning_weight && (
                        <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)' }}>
                          {c.morning_weight} kg
                        </div>
                      )}
                    </div>
                    {/* Score bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                      <div>
                        <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Energie</div>
                        <ScoreBar value={c.energy_level} />
                      </div>
                      <div>
                        <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Gevoel</div>
                        <ScoreBar value={c.mood} color="#a78bfa" />
                      </div>
                      <div>
                        <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Slaap</div>
                        <ScoreBar value={c.sleep_quality} color="#60a5fa" />
                      </div>
                      {c.soreness != null && (
                        <div>
                          <div style={{ ...B, fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Spierpijn</div>
                          <ScoreBar value={c.soreness} color="#f87171" />
                        </div>
                      )}
                    </div>
                    {c.notes && (
                      <div style={{ ...B, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 10, padding: '8px 12px', background: 'var(--dark3)', borderLeft: '2px solid var(--muted2)' }}>
                        &ldquo;{c.notes}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Statistieken — FIXED: geen NaN meer */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
            {[
              ['Gem. energie',   safeAvg(checkIns, 'energy_level'),  '⚡'],
              ['Gem. gevoel',    safeAvg(checkIns, 'mood'),           '😊'],
              ['Gem. slaap',     safeAvg(checkIns, 'sleep_quality'),  '💤'],
              ['Totaal check-ins', checkIns.length,                   '📊'],
              ['Laagste gewicht', safeMin(checkIns, 'morning_weight'), '⚖️'],
              ['Huidig gewicht', latestWeight ? latestWeight + ' kg' : '—', '📉'],
            ].map(([label, value, icon]) => (
              <div key={label} style={{ background: 'var(--dark2)', padding: '24px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                <div style={{ ...D, fontSize: 32, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>{value}</div>
                <div style={{ ...B, fontSize: 12, color: 'var(--muted)', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
