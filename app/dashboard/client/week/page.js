'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BottomNav, TopBar } from '@/app/dashboard/client/components'
import { fmtDateStr } from '@/lib/date-utils'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }
const DAYS      = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag']
const DAYS_SHORT = ['Ma','Di','Wo','Do','Vr','Za','Zo']
const TYPE_COLORS = { kracht: '#4ade80', conditie: '#38e8e8', gecombineerd: '#fb923c', mobiliteit: '#a78bfa', herstel: '#888' }

function getWeekDates(offset = 0) {
  const now = new Date(), day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d })
}

export default function WeekPage() {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [offset, setOffset] = React.useState(0)
  const [selectedDay, setSelectedDay] = React.useState(null)
  const [clientId, setClientId] = React.useState(null)
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).single()
      if (cp) {
        setClientId(cp.id)
        // Selecteer vandaag als actieve dag
        const todayIdx = new Date().getDay()
        setSelectedDay(todayIdx === 0 ? 6 : todayIdx - 1)
      }
    }
    init()
  }, [])

  React.useEffect(() => {
    if (!clientId) return
    const load = async () => {
      setLoading(true)
      const dates = getWeekDates(offset)
      const start = fmtDateStr(dates[0])
      const end   = fmtDateStr(dates[6])
      const { data } = await supabase.from('training_sessions').select('*, session_exercises(*, exercises(*))').eq('client_id', clientId).gte('session_date', start).lte('session_date', end).order('session_date')
      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [offset, clientId])

  const dates = getWeekDates(offset)
  const weekLabel = offset === 0 ? 'Deze week' : offset === 1 ? 'Volgende week' : offset === -1 ? 'Vorige week' : `Week ${offset > 0 ? '+' : ''}${offset}`
  const todayStr = fmtDateStr(new Date())
  const selIdx = selectedDay ?? (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
  const selDate = dates[selIdx] ? fmtDateStr(dates[selIdx]) : undefined
  const selSessions = sessions.filter(s => s.session_date === selDate)
  const typeColor = (t) => TYPE_COLORS[t?.toLowerCase()] || 'var(--orange)'

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }} className="has-bottom-nav">
      <TopBar title="Week" />
      <main style={{ padding: 'var(--page-px)', paddingTop: 16 }}>

        {/* Week header + navigatie */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ ...B, fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>{weekLabel}</div>
            <div style={{ ...D, fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
              {dates[0].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} — {dates[6].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setOffset(o => o-1)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, color: 'var(--text)', fontSize: 16, cursor: 'pointer' }}>←</button>
            {offset !== 0 && <button onClick={() => setOffset(0)} style={{ background: 'var(--card)', border: '1px solid var(--border-orange)', borderRadius: 8, padding: '0 10px', color: 'var(--orange)', ...B, fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>Nu</button>}
            <button onClick={() => setOffset(o => o+1)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, color: 'var(--text)', fontSize: 16, cursor: 'pointer' }}>→</button>
          </div>
        </div>

        {/* Link naar volledige agenda (maandweergave) */}
        <a href="/dashboard/client/agenda" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          background: 'var(--card)', border: '1px solid var(--border-orange)', borderRadius: 'var(--r-card)',
          padding: '14px 16px', marginBottom: 20, textDecoration: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div style={{ ...D, fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>Volledige agenda</div>
          </div>
          <span style={{ ...B, fontSize: 11, color: 'var(--orange)', fontWeight: 700 }}>→</span>
        </a>

        {/* Dag-pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {dates.map((date, i) => {
            const dStr = fmtDateStr(date)
            const hasSess = sessions.some(s => s.session_date === dStr)
            const isToday = dStr === todayStr
            const isSel = i === selIdx
            return (
              <button key={i} onClick={() => setSelectedDay(i)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 10px', borderRadius: 'var(--r-btn)', background: isSel ? 'var(--orange)' : 'var(--card)', border: `1px solid ${isSel ? 'var(--orange)' : isToday ? 'var(--border-orange)' : hasSess ? 'var(--border-orange)' : 'var(--border)'}`, minWidth: 42, flexShrink: 0, cursor: 'pointer' }}>
                <span style={{ ...B, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: isSel ? '#000' : 'var(--muted)', textTransform: 'uppercase' }}>{DAYS_SHORT[i]}</span>
                <span style={{ ...B, fontSize: 12, fontWeight: 700, color: isSel ? '#000' : isToday ? 'var(--orange)' : 'var(--muted)' }}>{date.getDate()}</span>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSel ? '#000' : hasSess ? 'var(--orange)' : 'var(--dark4)' }} />
              </button>
            )
          })}
        </div>

        {/* Geselecteerde dag */}
        <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
          {DAYS[selIdx]} <span style={{ ...B, fontFamily: 'var(--font-barlow)', fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>{selDate === todayStr ? '— Vandaag' : ''}</span>
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
                    <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{session.session_exercises?.length || 0} oefeningen</div>
                  </div>
                  <a href={`/dashboard/client/session/${session.id}`} style={{ background: session.status === 'voltooid' ? 'var(--dark3)' : 'var(--orange)', border: session.status === 'voltooid' ? '1px solid var(--border)' : 'none', borderRadius: 'var(--r-btn)', padding: '10px 16px', ...B, fontSize: 11, fontWeight: 700, color: session.status === 'voltooid' ? 'var(--text)' : '#000', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0, textDecoration: 'none' }}>
                    {session.status === 'voltooid' ? '✓ Bekijk' : session.status === 'in_uitvoering' ? 'Hervat →' : 'Start →'}
                  </a>
                </div>
                {session.session_exercises?.slice(0,5).map((ex, i) => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--border)' }}>
                    <span style={{ ...D, fontSize: 12, color: 'var(--orange)', fontWeight: 700, minWidth: 18 }}>{i+1}</span>
                    <span style={{ ...B, fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exercises?.name}</span>
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

        {/* Alle dagen overzicht */}
        {!loading && sessions.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="section-label">Overzicht hele week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {dates.map((date, i) => {
                const dStr = fmtDateStr(date)
                const daySess = sessions.filter(s => s.session_date === dStr)
                if (daySess.length === 0) return null
                return (
                  <button key={i} onClick={() => setSelectedDay(i)}
                    style={{ width: '100%', background: i === selIdx ? 'var(--card)' : 'var(--dark2)', borderRadius: 12, border: `1px solid ${i === selIdx ? 'var(--border-orange)' : 'var(--border)'}`, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ ...D, fontSize: 12, fontWeight: 700, color: 'var(--muted)', minWidth: 28, flexShrink: 0 }}>{DAYS_SHORT[i]}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                      {daySess.map(s => (
                        <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor(s.session_type), flexShrink: 0 }} />
                          <span style={{ ...B, fontSize: 13, color: 'var(--text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.session_name}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav active="week" />
    </div>
  )
}
