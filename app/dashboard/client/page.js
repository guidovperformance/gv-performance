'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return monday.toISOString().split('T')[0]
}

function getWeekEnd() {
  const now = new Date()
  const day = now.getDay()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + (day === 0 ? 0 : 7 - day))
  return sunday.toISOString().split('T')[0]
}

export default function ClientDashboard() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [menuOpen, setMenuOpen] = React.useState(false)
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

    const [todaySession, todayCheckin, recentCheckins, weekSessions, feedback] = await Promise.all([
      supabase.from('training_sessions')
        .select('*, session_exercises(*, exercises(*))')
        .eq('client_id', cp.id)
        .eq('session_date', today)
        .maybeSingle(),
      supabase.from('daily_checkins')
        .select('*')
        .eq('client_id', cp.id)
        .eq('checkin_date', today)
        .maybeSingle(),
      supabase.from('daily_checkins')
        .select('*')
        .eq('client_id', cp.id)
        .order('checkin_date', { ascending: false })
        .limit(7),
      // FIXED: gebruik * i.p.v. (count) want count werkt anders in PostgREST
      supabase.from('training_sessions')
        .select('*, session_exercises(*)')
        .eq('client_id', cp.id)
        .gte('session_date', getWeekStart())
        .lte('session_date', getWeekEnd())
        .order('day_of_week'),
      supabase.from('coach_feedback')
        .select('*')
        .eq('client_id', cp.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    setData({
      naam: profile?.full_name?.split(' ')[0] || 'Atleet',
      clientId: cp.id,
      todaySession: todaySession.data,
      todayCheckin: todayCheckin.data,
      recentCheckins: recentCheckins.data || [],
      weekSessions: weekSessions.data || [],
      feedback: feedback.data || [],
    })
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 24, color: 'var(--orange)' }}>
      LADEN...
    </div>
  )

  const todayLabel = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
  const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>

      {/* Header */}
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 16, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/dashboard/client/checkin" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none' }}>Check-in</a>
          <a href="/dashboard/client/week" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Week</a>
          <a href="/dashboard/client/history" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Voortgang</a>
          <button onClick={handleSignOut} style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Uit</button>
        </div>
      </header>

      <main style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1000, margin: '0 auto' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...B, fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{todayLabel}</div>
          <h1 style={{ ...D, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, letterSpacing: 1 }}>
            WELKOM, <span style={{ color: 'var(--orange)' }}>{data?.naam?.toUpperCase()}</span>
          </h1>
        </div>

        {/* Check-in banner */}
        {!data?.todayCheckin && (
          <a href="/dashboard/client/checkin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--orange-dim)', border: '1px solid rgba(255,77,0,0.4)', padding: '14px 20px', marginBottom: 24, textDecoration: 'none' }}>
            <div>
              <div style={{ ...D, fontSize: 15, fontWeight: 700, color: 'var(--orange)', letterSpacing: 1 }}>DAGELIJKSE CHECK-IN</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Je check-in van vandaag ontbreekt nog</div>
            </div>
            <div style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', flexShrink: 0, marginLeft: 16 }}>Invullen →</div>
          </a>
        )}

        {/* Main grid — stapelt op mobiel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

            {/* Training vandaag */}
            <div>
              <SectionLabel>Training vandaag</SectionLabel>
              {data?.todaySession ? (
                <div style={{ background: 'var(--dark2)', padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{data.todaySession.session_name}</div>
                      <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>
                        {data.todaySession.session_type} · {data.todaySession.session_exercises?.length || 0} oefeningen
                      </div>
                    </div>
                    <a href={`/dashboard/client/session/${data.todaySession.id}`}
                      style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 16px', textDecoration: 'none', flexShrink: 0 }}>
                      Start →
                    </a>
                  </div>
                  {data.todaySession.session_exercises?.slice(0, 5).map((ex, i) => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ ...D, fontSize: 12, color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{i + 1}</span>
                      <span style={{ ...B, fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exercises?.name}</span>
                      <span style={{ ...B, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                        {ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}
                      </span>
                    </div>
                  ))}
                  {data.todaySession.session_exercises?.length > 5 && (
                    <div style={{ ...B, fontSize: 11, color: 'var(--muted)', paddingTop: 8 }}>
                      +{data.todaySession.session_exercises.length - 5} meer oefeningen
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: 'var(--dark2)', padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                  <div style={{ ...D, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Geen training vandaag</div>
                  <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Hersteldag of coach heeft nog niets gepland.</div>
                  <a href="/dashboard/client/week"
                    style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>
                    Bekijk weekschema →
                  </a>
                </div>
              )}
            </div>

            {/* Week dots */}
            <div>
              <SectionLabel>Deze week</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
                {DAYS.map((day, i) => {
                  const session = data?.weekSessions?.find(s => s.day_of_week === i + 1)
                  const isToday = new Date().getDay() === (i === 6 ? 0 : i + 1)
                  return (
                    <div key={day} style={{ background: isToday ? 'rgba(255,77,0,0.1)' : 'var(--dark2)', border: `1px solid ${isToday ? 'rgba(255,77,0,0.4)' : 'transparent'}`, padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ ...B, fontSize: 10, letterSpacing: 1, color: isToday ? 'var(--orange)' : 'var(--muted)', textTransform: 'uppercase', marginBottom: 5 }}>{day}</div>
                      <div style={{ width: 7, height: 7, background: session ? 'var(--orange)' : 'var(--dark4)', borderRadius: '50%', margin: '0 auto' }} />
                    </div>
                  )
                })}
              </div>
              <a href="/dashboard/client/week"
                style={{ display: 'block', textAlign: 'center', ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
                Volledig weekschema →
              </a>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

            {/* Coach feedback */}
            {data?.feedback?.length > 0 && (
              <div>
                <SectionLabel>Coach feedback</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.feedback.map(f => (
                    <div key={f.id} style={{ background: 'var(--dark2)', padding: '14px 18px', borderLeft: '3px solid var(--orange)' }}>
                      <div style={{ ...B, fontSize: 10, color: 'var(--muted)', marginBottom: 5 }}>
                        {new Date(f.created_at).toLocaleDateString('nl-NL')}
                      </div>
                      <div style={{ ...B, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{f.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check-ins */}
            <div>
              <SectionLabel>Jouw check-ins</SectionLabel>
              {data?.recentCheckins?.length === 0 ? (
                <div style={{ background: 'var(--dark2)', padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Nog geen check-ins</div>
                  <a href="/dashboard/client/checkin"
                    style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none' }}>
                    Eerste check-in →
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.recentCheckins.slice(0, 5).map(c => (
                    <div key={c.id} style={{ background: 'var(--dark2)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ ...B, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                        {new Date(c.checkin_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {c.energy_level && <span style={{ ...B, fontSize: 11 }}>⚡{c.energy_level}</span>}
                        {c.mood && <span style={{ ...B, fontSize: 11 }}>😊{c.mood}</span>}
                        {c.morning_weight && <span style={{ ...D, fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>{c.morning_weight}kg</span>}
                      </div>
                    </div>
                  ))}
                  <a href="/dashboard/client/history"
                    style={{ display: 'block', textAlign: 'center', padding: '10px', ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', background: 'var(--dark2)' }}>
                    Alle check-ins →
                  </a>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <a href="/dashboard/client/checkin" style={{ background: 'var(--dark2)', padding: '18px 12px', textDecoration: 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>📊</div>
                <div style={{ ...D, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: 'var(--text)' }}>CHECK-IN</div>
              </a>
              <a href="/dashboard/client/history" style={{ background: 'var(--dark2)', padding: '18px 12px', textDecoration: 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>📈</div>
                <div style={{ ...D, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: 'var(--text)' }}>VOORTGANG</div>
              </a>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 700px) {
          main > div[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'block', width: 16, height: 2, background: 'var(--orange)' }} />
      {children}
    </div>
  )
}
