'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BottomNav, TopBar } from '@/app/dashboard/client/components'
import { fmtDateStr } from '@/lib/date-utils'

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const D = { fontFamily: "var(--font-oswald), Impact, sans-serif" }
const B = { fontFamily: "var(--font-barlow), sans-serif" }

function getWeekStart() {
  const d = new Date(), day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return fmtDateStr(mon)
}
function getWeekEnd() {
  const d = new Date(), day = d.getDay()
  const sun = new Date(d)
  sun.setDate(d.getDate() + (day === 0 ? 0 : 7 - day))
  return fmtDateStr(sun)
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
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
    const { data: cp } = await supabase.from('client_profiles').select('id, hrv_baseline').eq('user_id', user.id).single()
    if (!cp) { setLoading(false); return }
    const today = fmtDateStr(new Date())
    const [todaySess, todayCI, recentCI, weekSess, feedback] = await Promise.all([
      supabase.from('training_sessions').select('*, session_exercises(*, exercises(*))').eq('client_id', cp.id).eq('session_date', today).maybeSingle(),
      supabase.from('daily_checkins').select('*').eq('client_id', cp.id).eq('checkin_date', today).maybeSingle(),
      supabase.from('daily_checkins').select('*').eq('client_id', cp.id).order('checkin_date', { ascending: false }).limit(5),
      supabase.from('training_sessions').select('*, session_exercises(*)').eq('client_id', cp.id).gte('session_date', getWeekStart()).lte('session_date', getWeekEnd()).order('day_of_week'),
      supabase.from('coach_feedback').select('*').eq('client_id', cp.id).order('created_at', { ascending: false }).limit(3),
    ])
    setData({ naam: profile?.full_name?.split(' ')[0] || 'Atleet', clientId: cp.id, hrvBaseline: cp.hrv_baseline, todaySess: todaySess.data, todayCI: todayCI.data, recentCI: recentCI.data || [], weekSess: weekSess.data || [], feedback: feedback.data || [] })
    setLoading(false)
  }

  if (loading) return (
    <div style={{ background: '#141414', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 20, color: '#D4A857', letterSpacing: '3px' }}>
      LADEN...
    </div>
  )

  const DAYS = ['Ma','Di','Wo','Do','Vr','Za','Zo']
  const today = fmtDateStr(new Date())

  return (
    <div style={{ background: '#141414', minHeight: '100vh', paddingBottom: 80 }}>
      <TopBar showLogout={true} />
      <main style={{ padding: '16px 16px 0' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 20, paddingTop: 4 }}>
          <div style={{ ...B, fontSize: 11, color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>
            {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ ...D, fontSize: 28, fontWeight: 700, letterSpacing: '0.5px', color: '#f0ede8' }}>
            Hey, <span style={{ color: '#D4A857' }}>{data?.naam}</span>
          </div>
        </div>

        {/* Check-in banner */}
        {!data?.todayCI && (
          <Link href="/dashboard/client/checkin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(212,168,87,0.08)', border: '1px solid rgba(212,168,87,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, textDecoration: 'none' }}>
            <div>
              <div style={{ ...D, fontSize: 14, fontWeight: 700, color: '#D4A857', letterSpacing: '0.5px' }}>Dagelijkse check-in</div>
              <div style={{ ...B, fontSize: 12, color: '#666' }}>Nog niet ingevuld vandaag</div>
            </div>
            <div style={{ background: '#D4A857', borderRadius: 8, padding: '8px 14px', ...B, fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, fontFamily: "var(--font-barlow), sans-serif" }}>Invullen</div>
          </Link>
        )}

        {/* HRV-readiness */}
        <HrvReadinessBanner hrv={data?.todayCI?.hrv} baseline={data?.hrvBaseline} />

        {/* Training vandaag */}
        <SectionLabel>Training vandaag</SectionLabel>
        {data?.todaySess ? (
          <div style={{ background: '#1e1e1e', borderRadius: 16, border: '1px solid rgba(212,168,87,0.25)', padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
              <div>
                <TypeBadge type={data.todaySess.session_type} />
                <div style={{ ...D, fontSize: 22, fontWeight: 700, color: '#f0ede8', marginTop: 4 }}>{data.todaySess.session_name}</div>
                <div style={{ ...B, fontSize: 12, color: '#666', marginTop: 2 }}>{data.todaySess.session_exercises?.length || 0} oefeningen</div>
              </div>
              <Link href={`/dashboard/client/session/${data.todaySess.id}`} style={{ background: data.todaySess.status === 'voltooid' ? '#2a2a2a' : '#D4A857', border: data.todaySess.status === 'voltooid' ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 10, padding: '10px 18px', ...B, fontSize: 12, fontWeight: 700, color: data.todaySess.status === 'voltooid' ? '#f0ede8' : '#000', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, textDecoration: 'none', fontFamily: "var(--font-barlow), sans-serif" }}>
                {data.todaySess.status === 'voltooid' ? '✓ Bekijk' : data.todaySess.status === 'in_uitvoering' ? 'Hervat →' : 'Start →'}
              </Link>
            </div>
            {data.todaySess.session_exercises?.slice(0,4).map((ex, i) => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ ...D, fontSize: 12, color: '#D4A857', fontWeight: 700, minWidth: 18 }}>{i+1}</span>
                <span style={{ ...B, fontSize: 13, flex: 1, minWidth: 0, color: '#f0ede8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exercises?.name}</span>
                <span style={{ ...B, fontSize: 11, color: '#555', flexShrink: 0 }}>{ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#1e1e1e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '24px 18px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>😴</div>
            <div style={{ ...D, fontSize: 16, fontWeight: 700, color: '#f0ede8', marginBottom: 4 }}>Geen training vandaag</div>
            <div style={{ ...B, fontSize: 12, color: '#666', marginBottom: 14 }}>Hersteldag of coach plant binnenkort iets in.</div>
            <Link href="/dashboard/client/week" style={{ ...B, fontSize: 11, color: '#D4A857', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "var(--font-barlow), sans-serif" }}>Bekijk weekschema →</Link>
          </div>
        )}

        {/* Week strip */}
        <SectionLabel>Deze week</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {DAYS.map((day, i) => {
            const session = data?.weekSess?.find(s => s.day_of_week === i+1)
            const isToday = new Date().getDay() === (i === 6 ? 0 : i+1)
            return (
              <Link key={day} href="/dashboard/client/week" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 9px', borderRadius: 10, background: isToday ? '#D4A857' : '#1e1e1e', border: `1px solid ${isToday ? '#D4A857' : session ? 'rgba(212,168,87,0.3)' : 'rgba(255,255,255,0.06)'}`, minWidth: 44, minHeight: 56, flexShrink: 0, textDecoration: 'none' }}>
                <span style={{ ...B, fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: isToday ? '#000' : '#555', textTransform: 'uppercase', fontFamily: "var(--font-barlow), sans-serif" }}>{day}</span>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isToday ? '#000' : session ? '#D4A857' : '#2a2a2a' }} />
              </Link>
            )
          })}
        </div>

        {/* Coach feedback */}
        {data?.feedback?.length > 0 && (<>
          <SectionLabel>Coach feedback</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {data.feedback.map(f => (
              <div key={f.id} style={{ background: '#1e1e1e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #D4A857', padding: '14px 16px' }}>
                <div style={{ ...B, fontSize: 10, color: '#555', marginBottom: 5, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "var(--font-barlow), sans-serif" }}>{new Date(f.created_at).toLocaleDateString('nl-NL')}</div>
                <div style={{ ...B, fontSize: 14, lineHeight: 1.6, color: '#f0ede8' }}>{f.message}</div>
              </div>
            ))}
          </div>
        </>)}

        {/* Check-ins */}
        <SectionLabel>Check-ins</SectionLabel>
        {data?.recentCI?.length === 0 ? (
          <div style={{ background: '#1e1e1e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ ...B, fontSize: 13, color: '#666', marginBottom: 10, fontFamily: "var(--font-barlow), sans-serif" }}>Nog geen check-ins</div>
            <Link href="/dashboard/client/checkin" style={{ ...B, fontSize: 11, color: '#D4A857', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "var(--font-barlow), sans-serif" }}>Eerste check-in →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8 }}>
            {data.recentCI.map(c => (
              <div key={c.id} style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...B, fontSize: 12, color: '#666', fontFamily: "var(--font-barlow), sans-serif" }}>{new Date(c.checkin_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {c.energy_level && <span style={{ ...B, fontSize: 12, color: '#f0ede8' }}>⚡{c.energy_level}</span>}
                  {c.mood && <span style={{ ...B, fontSize: 12, color: '#f0ede8' }}>😊{c.mood}</span>}
                  {c.morning_weight && <span style={{ ...D, fontSize: 13, fontWeight: 700, color: '#D4A857' }}>{c.morning_weight}kg</span>}
                </div>
              </div>
            ))}
            <Link href="/dashboard/client/history" style={{ display: 'block', textAlign: 'center', padding: '14px', minHeight: 44, ...B, fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "var(--font-barlow), sans-serif" }}>Alle check-ins →</Link>
          </div>
        )}
      </main>
      <BottomNav active="home" />
    </div>
  )
}

function HrvReadinessBanner({ hrv, baseline }) {
  if (!baseline) return null
  if (hrv == null) {
    return (
      <div style={{ background: '#1e1e1e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', marginBottom: 16, ...B, fontSize: 12, color: '#666' }}>
        Vul je HRV in bij de check-in voor je trainingsadvies van vandaag.
      </div>
    )
  }
  const ratio = hrv / baseline
  const status = ratio >= 0.95 ? 'green' : ratio >= 0.85 ? 'yellow' : 'red'
  const CONFIG = {
    green:  { color: '#4ade80', label: '🟢 Goed herstel', advice: 'Ga voor je geplande training.' },
    yellow: { color: '#ffe066', label: '🟡 Matig herstel', advice: '-20% volume vandaag.' },
    red:    { color: '#f87171', label: '🔴 Laag herstel', advice: 'Mobiliteit of LSD vandaag — geen zware training.' },
  }
  const c = CONFIG[status]
  return (
    <div style={{ background: '#1e1e1e', borderRadius: 14, border: `1px solid ${c.color}44`, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ ...D, fontSize: 14, fontWeight: 700, color: c.color, letterSpacing: 0.5, marginBottom: 4 }}>{c.label}</div>
      <div style={{ ...B, fontSize: 13, color: '#f0ede8' }}>{c.advice}</div>
      <div style={{ ...B, fontSize: 11, color: '#666', marginTop: 4 }}>HRV {hrv}ms · baseline {baseline}ms</div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "var(--font-barlow), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#D4A857', textTransform: 'uppercase', marginBottom: 10 }}>
      <span style={{ display: 'block', width: 14, height: 2, background: '#D4A857', borderRadius: 1, flexShrink: 0 }}/>
      {children}
    </div>
  )
}

function TypeBadge({ type }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(212,168,87,0.1)', color: '#D4A857', border: '1px solid rgba(212,168,87,0.25)', fontFamily: "var(--font-barlow), sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
      {type}
    </span>
  )
}
