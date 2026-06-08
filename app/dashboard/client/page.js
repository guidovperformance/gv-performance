'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

function getWeekStart() {
  const d = new Date(), day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return mon.toISOString().split('T')[0]
}
function getWeekEnd() {
  const d = new Date(), day = d.getDay()
  const sun = new Date(d)
  sun.setDate(d.getDate() + (day === 0 ? 0 : 7 - day))
  return sun.toISOString().split('T')[0]
}

export default function ClientDashboard() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
    if (!cp) { setLoading(false); return }
    const today = new Date().toISOString().split('T')[0]
    const [todaySess, todayCI, recentCI, weekSess, feedback] = await Promise.all([
      supabase.from('training_sessions').select('*, session_exercises(*, exercises(*))').eq('client_id', cp.id).eq('session_date', today).maybeSingle(),
      supabase.from('daily_checkins').select('*').eq('client_id', cp.id).eq('checkin_date', today).maybeSingle(),
      supabase.from('daily_checkins').select('*').eq('client_id', cp.id).order('checkin_date', { ascending: false }).limit(5),
      supabase.from('training_sessions').select('*, session_exercises(*)').eq('client_id', cp.id).gte('session_date', getWeekStart()).lte('session_date', getWeekEnd()).order('day_of_week'),
      supabase.from('coach_feedback').select('*').eq('client_id', cp.id).order('created_at', { ascending: false }).limit(3),
    ])
    setData({ naam: profile?.full_name?.split(' ')[0] || 'Atleet', clientId: cp.id, todaySess: todaySess.data, todayCI: todayCI.data, recentCI: recentCI.data || [], weekSess: weekSess.data || [], feedback: feedback.data || [] })
    setLoading(false)
  }

  if (loading) return <LoadingScreen />

  const DAYS = ['Ma','Di','Wo','Do','Vr','Za','Zo']
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="has-bottom-nav">
      <TopBar title="Home" />
      <main style={{ padding: 'var(--page-px)', paddingTop: 20 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...B, fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>
            {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 0.5 }}>
            Hey, <span style={{ color: 'var(--orange)' }}>{data?.naam}</span> 👋
          </div>
        </div>

        {/* Check-in banner */}
        {!data?.todayCI && (
          <a href="/dashboard/client/checkin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--orange-dim)', border: '1px solid var(--border-orange)', borderRadius: 'var(--r-card)', padding: '14px 18px', marginBottom: 20, textDecoration: 'none' }}>
            <div>
              <div style={{ ...D, fontSize: 14, fontWeight: 700, color: 'var(--orange)', letterSpacing: 1 }}>Dagelijkse check-in</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Nog niet ingevuld vandaag</div>
            </div>
            <div style={{ background: 'var(--orange)', borderRadius: 8, padding: '8px 14px', ...B, fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>Invullen</div>
          </a>
        )}

        {/* Training vandaag */}
        <div className="section-label">Training vandaag</div>
        {data?.todaySess ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border-orange)', padding: '18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
              <div>
                <span className="badge badge-orange" style={{ marginBottom: 6 }}>{data.todaySess.session_type}</span>
                <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>{data.todaySess.session_name}</div>
                <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{data.todaySess.session_exercises?.length || 0} oefeningen</div>
              </div>
              <a href={`/dashboard/client/session/${data.todaySess.id}`} style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', padding: '10px 18px', ...B, fontSize: 12, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0, textDecoration: 'none' }}>Start →</a>
            </div>
            {data.todaySess.session_exercises?.slice(0,4).map((ex, i) => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i === 0 ? '1px solid var(--border)' : '1px solid var(--border)' }}>
                <span style={{ ...D, fontSize: 12, color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{i+1}</span>
                <span style={{ ...B, fontSize: 13, flex: 1 }}>{ex.exercises?.name}</span>
                <span style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}</span>
              </div>
            ))}
            {data.todaySess.session_exercises?.length > 4 && (
              <div style={{ ...B, fontSize: 11, color: 'var(--muted)', paddingTop: 6 }}>+{data.todaySess.session_exercises.length - 4} meer</div>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '24px 18px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>😴</div>
            <div style={{ ...D, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Geen training vandaag</div>
            <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Hersteldag of coach plant binnenkort iets in.</div>
            <a href="/dashboard/client/week" style={{ ...B, fontSize: 11, color: 'var(--orange)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Bekijk weekschema →</a>
          </div>
        )}

        {/* Week strip */}
        <div className="section-label">Deze week</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {DAYS.map((day, i) => {
            const session = data?.weekSess?.find(s => s.day_of_week === i+1)
            const isToday = new Date().getDay() === (i === 6 ? 0 : i+1)
            return (
              <a key={day} href="/dashboard/client/week" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 10px', borderRadius: 'var(--r-btn)', background: isToday ? 'var(--orange)' : 'var(--card)', border: `1px solid ${isToday ? 'var(--orange)' : session ? 'var(--border-orange)' : 'var(--border)'}`, minWidth: 42, flexShrink: 0, textDecoration: 'none' }}>
                <span style={{ ...B, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: isToday ? '#000' : 'var(--muted)', textTransform: 'uppercase' }}>{day}</span>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isToday ? '#000' : session ? 'var(--orange)' : 'var(--dark4)' }} />
              </a>
            )
          })}
        </div>

        {/* Coach feedback */}
        {data?.feedback?.length > 0 && (<>
          <div className="section-label">Coach feedback</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {data.feedback.map(f => (
              <div key={f.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--orange)', padding: '14px 16px' }}>
                <div style={{ ...B, fontSize: 10, color: 'var(--muted)', marginBottom: 5 }}>{new Date(f.created_at).toLocaleDateString('nl-NL')}</div>
                <div style={{ ...B, fontSize: 14, lineHeight: 1.6 }}>{f.message}</div>
              </div>
            ))}
          </div>
        </>)}

        {/* Recent check-ins */}
        <div className="section-label">Check-ins</div>
        {data?.recentCI?.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Nog geen check-ins</div>
            <a href="/dashboard/client/checkin" style={{ ...B, fontSize: 11, color: 'var(--orange)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Eerste check-in →</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.recentCI.map(c => (
              <div key={c.id} style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>{new Date(c.checkin_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {c.energy_level && <span style={{ ...B, fontSize: 12 }}>⚡{c.energy_level}</span>}
                  {c.mood && <span style={{ ...B, fontSize: 12 }}>😊{c.mood}</span>}
                  {c.morning_weight && <span style={{ ...D, fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>{c.morning_weight}kg</span>}
                </div>
              </div>
            ))}
            <a href="/dashboard/client/history" style={{ display: 'block', textAlign: 'center', padding: '12px', ...B, fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Alle check-ins →</a>
          </div>
        )}
      </main>
      <BottomNav active="home" />
    </div>
  )
}

export function TopBar({ title, backHref, backLabel }) {
  return (
    <header style={{ background: 'var(--dark2)', borderBottom: '1px solid var(--border)', padding: '14px var(--page-px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="20" height="18" viewBox="0 0 36 34">
          <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
          <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
          <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-oswald), sans-serif', fontSize: 14, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
      </div>
      {backHref && (
        <a href={backHref} style={{ ...{ fontFamily: 'var(--font-barlow), sans-serif' }, fontSize: 11, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>← {backLabel || 'Terug'}</a>
      )}
    </header>
  )
}

export function BottomNav({ active }) {
  const items = [
    { href: '/dashboard/client', id: 'home', icon: '🏠', label: 'Home' },
    { href: '/dashboard/client/week', id: 'week', icon: '📅', label: 'Week' },
    { href: '/dashboard/client/checkin', id: 'checkin', icon: '✅', label: 'Check-in' },
    { href: '/dashboard/client/history', id: 'history', icon: '📈', label: 'Voortgang' },
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--dark2)', borderTop: '1px solid var(--border)', display: 'flex', padding: '10px 0 calc(10px + env(safe-area-inset-bottom, 0px))', zIndex: 100 }}>
      {items.map(item => (
        <a key={item.id} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: active === item.id ? 'var(--orange)' : 'var(--muted)', textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  )
}

function LoadingScreen() {
  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-oswald), sans-serif', fontSize: 20, color: 'var(--orange)', letterSpacing: 3 }}>
      LADEN...
    </div>
  )
}
