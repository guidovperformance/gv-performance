'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
const DAYS_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

function getWeekDates(offset = 0) {
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

export default function WeekSchedule() {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [weekOffset, setWeekOffset] = React.useState(0)
  const [clientId, setClientId] = React.useState(null)
  const router = useRouter()
  const supabase = createClient()

  // Laad klant eenmalig
  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
      if (cp) setClientId(cp.id)
    }
    init()
  }, [])

  // FIXED: bereken datums BINNEN de effect om stale closure te voorkomen
  React.useEffect(() => {
    if (!clientId) return

    const load = async () => {
      setLoading(true)
      // Datums berekend hier zodat ze altijd vers zijn
      const dates = getWeekDates(weekOffset)
      const weekStart = dates[0].toISOString().split('T')[0]
      const weekEnd = dates[6].toISOString().split('T')[0]

      const { data } = await supabase
        .from('training_sessions')
        .select('*, session_exercises(*, exercises(*))')
        .eq('client_id', clientId)
        .gte('session_date', weekStart)
        .lte('session_date', weekEnd)
        .order('session_date')

      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [weekOffset, clientId])

  const weekDates = getWeekDates(weekOffset)
  const weekLabel = weekOffset === 0 ? 'Deze week'
    : weekOffset === 1 ? 'Volgende week'
    : weekOffset === -1 ? 'Vorige week'
    : `Over ${weekOffset} weken`

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
          <div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 4 }}>{weekLabel}</div>
            <h1 style={{ ...D, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: 1 }}>WEEKSCHEMA</h1>
            <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {weekDates[0].toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })} — {weekDates[6].toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setWeekOffset(o => o - 1)}
              style={{ background: 'var(--dark2)', border: '1px solid var(--dark4)', color: 'var(--text)', ...B, fontSize: 18, padding: '8px 14px', cursor: 'pointer' }}>←</button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)}
                style={{ background: 'var(--dark2)', border: '1px solid var(--orange)', color: 'var(--orange)', ...B, fontSize: 11, letterSpacing: 1, padding: '8px 14px', cursor: 'pointer' }}>Nu</button>
            )}
            <button onClick={() => setWeekOffset(o => o + 1)}
              style={{ background: 'var(--dark2)', border: '1px solid var(--dark4)', color: 'var(--text)', ...B, fontSize: 18, padding: '8px 14px', cursor: 'pointer' }}>→</button>
          </div>
        </div>

        {/* Week dots navigatie */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 16 }}>
          {weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0]
            const hasSessions = sessions.some(s => s.session_date === dateStr)
            const isToday = dateStr === new Date().toISOString().split('T')[0]
            return (
              <div key={i} style={{ background: isToday ? 'rgba(255,77,0,0.1)' : 'var(--dark2)', border: `1px solid ${isToday ? 'rgba(255,77,0,0.4)' : 'transparent'}`, padding: '8px 4px', textAlign: 'center' }}>
                <div style={{ ...B, fontSize: 10, color: isToday ? 'var(--orange)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{DAYS_SHORT[i]}</div>
                <div style={{ ...B, fontSize: 11, color: isToday ? 'var(--orange)' : 'var(--muted2)', marginBottom: 4 }}>{date.getDate()}</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: hasSessions ? 'var(--orange)' : 'var(--dark4)', margin: '0 auto' }} />
              </div>
            )
          })}
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
                <div key={i} style={{ background: isToday ? 'rgba(255,77,0,0.04)' : 'var(--dark2)', border: `1px solid ${isToday ? 'rgba(255,77,0,0.2)' : 'transparent'}`, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: daySessions.length > 0 ? 14 : 0 }}>
                    <div style={{ ...D, fontSize: 15, fontWeight: 700, color: isToday ? 'var(--orange)' : 'var(--muted)', letterSpacing: 2, minWidth: 90 }}>
                      {DAYS[i].toUpperCase()}
                    </div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted2)' }}>
                      {date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
                    </div>
                    {daySessions.length === 0 && (
                      <div style={{ ...B, fontSize: 11, color: 'var(--dark4)', marginLeft: 'auto' }}>Rust</div>
                    )}
                    {isToday && daySessions.length === 0 && (
                      <div style={{ ...B, fontSize: 10, color: 'rgba(255,77,0,0.5)', marginLeft: 4, letterSpacing: 1 }}>VANDAAG</div>
                    )}
                  </div>
                  {daySessions.map(session => (
                    <div key={session.id} style={{ background: 'var(--dark3)', padding: '14px 18px', marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...D, fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>{session.session_name || 'Training'}</div>
                          <div style={{ ...B, fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>
                            {session.session_type} · {session.session_exercises?.length || 0} oefeningen
                          </div>
                        </div>
                        <a href={`/dashboard/client/session/${session.id}`}
                          style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', textDecoration: 'none', flexShrink: 0 }}>
                          Start →
                        </a>
                      </div>
                      {session.session_exercises?.slice(0, 4).map((ex, j) => (
                        <div key={j} style={{ display: 'flex', gap: 10, padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                          <span style={{ ...D, fontSize: 11, color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{j + 1}</span>
                          <span style={{ ...B, fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exercises?.name}</span>
                          <span style={{ ...B, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                            {ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}
                          </span>
                        </div>
                      ))}
                      {session.session_exercises?.length > 4 && (
                        <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                          +{session.session_exercises.length - 4} meer oefeningen
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
            <div style={{ ...D, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Geen trainingen gepland</div>
            <div style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>
              {weekOffset === 0 ? 'Je coach heeft voor deze week nog geen trainingen gepland.' : 'Geen trainingen in deze week.'}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
