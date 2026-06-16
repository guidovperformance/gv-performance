'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BottomNav, TopBar } from '@/app/dashboard/client/components'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

function safeAvg(arr, key) {
  const v = arr.filter(c => c[key] > 0).map(c => parseFloat(c[key]))
  return v.length ? (v.reduce((a,b) => a+b, 0) / v.length).toFixed(1) : '—'
}

export default function HistoryPage() {
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
      const { data } = await supabase.from('daily_checkins').select('*').eq('client_id', cp.id).order('checkin_date', { ascending: false }).limit(60)
      setCheckIns(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const latestWeight = checkIns.find(c => c.morning_weight)?.morning_weight
  const minWeight = checkIns.filter(c => c.morning_weight).length ? Math.min(...checkIns.filter(c => c.morning_weight).map(c => parseFloat(c.morning_weight))) : null

  const ScoreBar = ({ value, color }) => {
    if (!value) return <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>—</span>
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--dark4)', borderRadius: 2, minWidth: 36 }}>
          <div style={{ width: `${(value/5)*100}%`, height: '100%', background: color || 'var(--orange)', borderRadius: 2 }} />
        </div>
        <span style={{ ...D, fontSize: 12, fontWeight: 700, color: color || 'var(--orange)', minWidth: 12 }}>{value}</span>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="has-bottom-nav">
      <TopBar title="Voortgang" />
      <main style={{ padding: 'var(--page-px)', paddingTop: 16 }}>
        <div style={{ ...D, fontSize: 26, fontWeight: 700, letterSpacing: 0.5, marginBottom: 20 }}>Voortgang</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card)', borderRadius: 'var(--r-btn)', padding: 4, border: '1px solid var(--border)' }}>
          {[['checkins','📊 Check-ins'],['stats','📈 Stats']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ flex: 1, background: tab===k ? 'var(--orange)' : 'transparent', borderRadius: 8, border: 'none', padding: '10px', ...B, fontSize: 12, fontWeight: 700, letterSpacing: 1, color: tab===k ? '#000' : 'var(--muted)', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, ...D, fontSize: 16, color: 'var(--orange)', letterSpacing: 2 }}>LADEN...</div>
        ) : tab === 'checkins' ? (
          checkIns.length === 0 ? (
            <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ ...D, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Nog geen check-ins</div>
              <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Doe je eerste check-in om bij te houden hoe je je voelt.</div>
              <a href="/dashboard/client/checkin" style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', padding: '12px 24px', ...B, fontSize: 12, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>Check-in doen</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {checkIns.map(c => (
                <div key={c.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ ...D, fontSize: 14, fontWeight: 700 }}>{new Date(c.checkin_date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    {c.morning_weight && <div style={{ ...D, fontSize: 18, fontWeight: 700, color: 'var(--orange)' }}>{c.morning_weight} kg</div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Energie</div><ScoreBar value={c.energy_level} color="#38e8e8" /></div>
                    <div><div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Gevoel</div><ScoreBar value={c.mood} color="#a78bfa" /></div>
                    <div><div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Slaap</div><ScoreBar value={c.sleep_quality} color="#60a5fa" /></div>
                    <div><div style={{ ...B, fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Spierpijn</div><ScoreBar value={c.soreness} color="#fb923c" /></div>
                  </div>
                  {c.notes && <div style={{ ...B, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 10, padding: '8px 12px', background: 'var(--dark2)', borderRadius: 8 }}>&ldquo;{c.notes}&rdquo;</div>}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Stats */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[
                ['Total check-ins', checkIns.length, '📊', 'var(--orange)'],
                ['Huidig gewicht', latestWeight ? `${latestWeight} kg` : '—', '⚖️', '#4ade80'],
                ['Laagste gewicht', minWeight ? `${minWeight} kg` : '—', '📉', '#38e8e8'],
                ['Gem. energie', safeAvg(checkIns,'energy_level'), '⚡', '#38e8e8'],
                ['Gem. gevoel', safeAvg(checkIns,'mood'), '😊', '#a78bfa'],
                ['Gem. slaap', safeAvg(checkIns,'sleep_quality'), '💤', '#60a5fa'],
              ].map(([label, value, icon, color]) => (
                <div key={label} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px 14px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                  <div style={{ ...D, fontSize: 26, fontWeight: 700, color, marginBottom: 3 }}>{value}</div>
                  <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav active="history" />
    </div>
  )
}
