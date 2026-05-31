'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']

export default function WeekSchedule() {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [weekOffset, setWeekOffset] = React.useState(0)
  const router = useRouter()
  const supabase = createClient()

  const getWeekDates = (offset = 0) => {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }

  const weekDates = getWeekDates(weekOffset)
  const weekStart = weekDates[0].toISOString().split('T')[0]
  const weekEnd = weekDates[6].toISOString().split('T')[0]

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: cp } = await supabase
        .from('client_profiles').select('id').eq('user_id', user.id).single()
      if (!cp) { setLoading(false); return }

      const { data } = await supabase
        .from('training_sessions')
        .select('*, session_exercises(*, exercises(*))')
        .eq('client_id', cp.id)
        .gte('session_date', weekStart)
        .lte('session_date', weekEnd)
        .order('session_date')

      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [weekOffset])

  const weekLabel = weekOffset === 0 ? 'Deze week' : weekOffset === 1 ? 'Volgende week' : weekOffset === -1 ? 'Vorige week' : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700 }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/client" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Dashboard</a>
      </header>

      <main style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 6 }}>{weekLabel}</div>
            <h1 style={{ ...D, fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>WEEKSCHEMA</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ background: 'var(--dark2)', border: '1px solid var(--dark4)', color: 'var(--text)', ...B, fontSize: 18, padding: '8px 16px', cursor: 'pointer' }}>←</button>
            <button onClick={() => setWeekOffset(0)} style={{ background: weekOffset === 0 ? 'var(--orange)' : 'var(--dark2)', border: '1px solid var(--dark4)', color: weekOffset === 0 ? '#000' : 'var(--text)', ...B, fontSize: 12, letterSpacing: 1, padding: '8px 16px', cursor: 'pointer' }}>Vandaag</button>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ background: 'var(--dark2)', border: '1px solid var(--dark4)', color: 'var(--text)', ...B, fontSize: 18, padding: '8px 16px', cursor: 'pointer' }}>→</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, ...D, fontSize: 20, color: 'var(--orange)' }}>LADEN...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {weekDates.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0]
              const daySessions = sessions.filter(s => s.session_date === dateStr)
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              return (
                <div key={i} style={{ background: isToday ? 'rgba(255,77,0,0.05)' : 'var(--dark2)', border: `1px solid ${isToday ? 'rgba(255,77,0,0.3)' : 'transparent'}`, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: daySessions.length > 0 ? 16 : 0 }}>
                    <div style={{ ...D, fontSize: 16, fontWeight: 700, color: isToday ? 'var(--orange)' : 'var(--muted)', letterSpacing: 2, minWidth: 100 }}>{DAYS[i].toUpperCase()}</div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted2)' }}>{date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}</div>
                    {daySessions.length === 0 && <div style={{ ...B, fontSize: 12, color: 'var(--dark4)', marginLeft: 'auto' }}>Rust</div>}
                  </div>
                  {daySessions.map(session => (
                    <div key={session.id} style={{ background: 'var(--dark3)', padding: '16px 20px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{session.session_name || 'Training'}</div>
                          <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>{session.session_type} · {session.session_exercises?.length || 0} oefeningen</div>
                        </div>
                        <a href={`/dashboard/client/session/${session.id}`} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', textDecoration: 'none' }}>Start →</a>
                      </div>
                      {session.session_exercises?.slice(0, 3).map((ex, j) => (
                        <div key={j} style={{ display: 'flex', gap: 12, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                          <span style={{ ...D, fontSize: 12, color: 'var(--orange)', fontWeight: 700, minWidth: 20 }}>{j + 1}</span>
                          <span style={{ ...B, fontSize: 13, flex: 1 }}>{ex.exercises?.name}</span>
                          <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>{ex.sets}x{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}</span>
                        </div>
                      ))}
                      {session.session_exercises?.length > 3 && (
                        <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>+{session.session_exercises.length - 3} meer oefeningen</div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
