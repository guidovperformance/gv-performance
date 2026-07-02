'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BottomNav, TopBar } from '@/app/dashboard/client/components'
import { fmtDateStr } from '@/lib/date-utils'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const DAYS_SHORT = ['Ma','Di','Wo','Do','Vr','Za','Zo']
const TYPE_COLORS = { kracht: '#4ade80', conditie: '#38e8e8', gecombineerd: '#fb923c', mobiliteit: '#a78bfa', herstel: '#888' }

function toDateStr(d) { return fmtDateStr(d) }

function buildMonthGrid(year, month) {
  // month: 0-indexed. Geeft array van Date-objecten, week begint op maandag, vult vorige/volgende maand aan.
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = (firstOfMonth.getDay() + 6) % 7 // 0 = maandag
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(firstOfMonth.getDate() - startWeekday)

  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    days.push(d)
  }
  return days
}

export default function AgendaPage() {
  const today = new Date()
  const [year, setYear] = React.useState(today.getFullYear())
  const [month, setMonth] = React.useState(today.getMonth())
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [selectedDate, setSelectedDate] = React.useState(toDateStr(today))
  const [clientId, setClientId] = React.useState(null)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
      if (cp) setClientId(cp.id)
    }
    init()
  }, [])

  React.useEffect(() => {
    if (!clientId) return
    const load = async () => {
      setLoading(true)
      const days = buildMonthGrid(year, month)
      const start = toDateStr(days[0])
      const end = toDateStr(days[days.length - 1])
      const { data } = await supabase.from('training_sessions')
        .select('*, session_exercises(*, exercises(*))')
        .eq('client_id', clientId)
        .gte('session_date', start)
        .lte('session_date', end)
        .order('session_date')
      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [year, month, clientId])

  const days = buildMonthGrid(year, month)
  const todayStr = toDateStr(today)
  const typeColor = (t) => TYPE_COLORS[t?.toLowerCase()] || 'var(--orange)'
  const selSessions = sessions.filter(s => s.session_date === selectedDate)

  const goPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const goNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(todayStr) }

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="has-bottom-nav">
      <TopBar backHref="/dashboard/client/week" backLabel="Week" title="Agenda" />
      <main style={{ padding: 'var(--page-px)', paddingTop: 16 }}>

        {/* Maand header + navigatie */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>{MONTHS[month]} {year}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={goPrevMonth} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, color: 'var(--text)', fontSize: 16, cursor: 'pointer' }}>←</button>
            <button onClick={goToday} style={{ background: 'var(--card)', border: '1px solid var(--border-orange)', borderRadius: 8, padding: '0 10px', color: 'var(--orange)', ...B, fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>Nu</button>
            <button onClick={goNextMonth} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, color: 'var(--text)', fontSize: 16, cursor: 'pointer' }}>→</button>
          </div>
        </div>

        {/* Weekdag-labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {DAYS_SHORT.map(d => (
            <div key={d} style={{ ...B, fontSize: 10, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Maandgrid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 20 }}>
          {days.map((date, i) => {
            const dStr = toDateStr(date)
            const inMonth = date.getMonth() === month
            const daySess = sessions.filter(s => s.session_date === dStr)
            const isToday = dStr === todayStr
            const isSel = dStr === selectedDate
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dStr)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  aspectRatio: '1', minHeight: 44, borderRadius: 10,
                  background: isSel ? 'var(--orange)' : 'var(--card)',
                  border: `1px solid ${isSel ? 'var(--orange)' : isToday ? 'var(--border-orange)' : 'var(--border)'}`,
                  opacity: inMonth ? 1 : 0.35,
                  cursor: 'pointer',
                }}
              >
                <span style={{ ...B, fontSize: 13, fontWeight: 700, color: isSel ? '#000' : isToday ? 'var(--orange)' : 'var(--text)' }}>{date.getDate()}</span>
                {daySess.length > 0 && (
                  <div style={{ display: 'flex', gap: 2 }}>
                    {daySess.slice(0, 3).map(s => (
                      <div key={s.id} style={{ width: 4, height: 4, borderRadius: '50%', background: isSel ? '#000' : typeColor(s.session_type) }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Geselecteerde dag */}
        <div style={{ ...D, fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
          {new Date(selectedDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
          {selectedDate === todayStr && <span style={{ ...B, fontFamily: 'var(--font-barlow)', fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}> — Vandaag</span>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, ...D, fontSize: 16, color: 'var(--orange)', letterSpacing: 2 }}>LADEN...</div>
        ) : selSessions.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '28px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>😴</div>
            <div style={{ ...D, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Geen training</div>
            <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Rust of nog niet ingepland door coach.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selSessions.map(session => (
              <div key={session.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px', borderLeft: `3px solid ${typeColor(session.session_type)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                  <div>
                    <span className="badge" style={{ background: typeColor(session.session_type)+'18', color: typeColor(session.session_type), marginBottom: 6 }}>{session.session_type}</span>
                    <div style={{ ...D, fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>{session.session_name}</div>
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{session.session_exercises?.length === 1 ? '1 oefening' : `${session.session_exercises?.length || 0} oefeningen`}</div>
                  </div>
                  <a href={`/dashboard/client/session/${session.id}`} style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', padding: '10px 16px', ...B, fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0, textDecoration: 'none' }}>Start →</a>
                </div>
                {session.session_exercises?.slice(0,5).map((ex, i) => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--border)' }}>
                    <span style={{ ...D, fontSize: 12, color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{i+1}</span>
                    <span style={{ ...B, fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exercise_name || ex.exercises?.name}</span>
                    <span style={{ ...B, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}</span>
                  </div>
                ))}
                {session.session_exercises?.length > 5 && (
                  <div style={{ ...B, fontSize: 11, color: 'var(--muted)', paddingTop: 6 }}>+{session.session_exercises.length - 5} meer</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav active="week" />
    </div>
  )
}
