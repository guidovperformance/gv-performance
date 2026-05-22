'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function ClientDashboard() {
  const [user, setUser] = React.useState(null)
  const [profile, setProfile] = React.useState(null)
  const [todaySession, setTodaySession] = React.useState(null)
  const [todayCheckin, setTodayCheckin] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)

    // Get client profile
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('*, profiles(full_name)')
      .eq('user_id', user.id)
      .single()
    setProfile(clientProfile)

    // Get today's training session
    const today = new Date().toISOString().split('T')[0]
    const { data: session } = await supabase
      .from('training_sessions')
      .select(`*, session_exercises(*, exercises(*))`)
      .eq('client_id', clientProfile?.id)
      .eq('session_date', today)
      .single()
    setTodaySession(session)

    // Get today's check-in
    const { data: checkin } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('client_id', clientProfile?.id)
      .eq('checkin_date', today)
      .single()
    setTodayCheckin(checkin)

    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...D, fontSize: 24, letterSpacing: 2, color: 'var(--orange)' }}>LADEN...</div>
    </div>
  )

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>

      {/* Header */}
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/dashboard/client/checkin" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none' }}>Check-in</a>
          <a href="/dashboard/client/history" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>Historie</a>
          <button onClick={handleSignOut} style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Uitloggen</button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ ...B, fontSize: 12, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            {today}
          </div>
          <h1 style={{ ...D, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, letterSpacing: 1, color: 'var(--text)' }}>
            WELKOM TERUG, <span style={{ color: 'var(--orange)' }}>{profile?.profiles?.full_name?.split(' ')[0]?.toUpperCase() || 'ATLEET'}</span>
          </h1>
        </div>

        {/* Check-in banner */}
        {!todayCheckin && (
          <a href="/dashboard/client/checkin" style={{ display: 'block', background: 'var(--orange-dim)', border: '1px solid rgba(255,77,0,0.4)', padding: '16px 24px', marginBottom: 32, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)', letterSpacing: 1 }}>DAGELIJKSE CHECK-IN</div>
              <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>Je check-in van vandaag ontbreekt nog</div>
            </div>
            <div style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)' }}>Invullen →</div>
          </a>
        )}

        {/* Today's training */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 20, height: 2, background: 'var(--orange)' }} />Training van vandaag
          </div>

          {todaySession ? (
            <div style={{ background: 'var(--dark2)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{todaySession.session_name}</div>
                  <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>{todaySession.session_type} · {todaySession.session_exercises?.length} oefeningen</div>
                </div>
                <a href={`/dashboard/client/session/${todaySession.id}`} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', textDecoration: 'none' }}>
                  Start training →
                </a>
              </div>

              {/* Exercise preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todaySession.session_exercises?.slice(0, 4).map((ex, i) => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ ...D, fontSize: 13, color: 'var(--orange)', fontWeight: 700, width: 24 }}>{i + 1}</div>
                    <div style={{ flex: 1, ...D, fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>{ex.exercises?.name}</div>
                    <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>{ex.sets}x{ex.reps} {ex.weight_kg ? `@ ${ex.weight_kg}kg` : ''}</div>
                  </div>
                ))}
                {todaySession.session_exercises?.length > 4 && (
                  <div style={{ ...B, fontSize: 12, color: 'var(--muted)', paddingTop: 8 }}>+{todaySession.session_exercises.length - 4} meer oefeningen</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--dark2)', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
              <div style={{ ...D, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Geen training gepland vandaag</div>
              <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Hersteldag of je coach heeft nog niets ingepland.</div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <a href="/dashboard/client/week" style={{ background: 'var(--dark2)', padding: '24px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
            <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, color: 'var(--text)', marginBottom: 4 }}>WEEKSCHEMA</div>
            <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Bekijk je trainingen deze week</div>
          </a>
          <a href="/dashboard/client/checkin" style={{ background: 'var(--dark2)', padding: '24px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
            <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, color: 'var(--text)', marginBottom: 4 }}>CHECK-IN</div>
            <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Hoe voel je je vandaag?</div>
          </a>
          <a href="/dashboard/client/history" style={{ background: 'var(--dark2)', padding: '24px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
            <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, color: 'var(--text)', marginBottom: 4 }}>VOORTGANG</div>
            <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Bekijk jouw progressie</div>
          </a>
        </div>

      </main>
    </div>
  )
}
