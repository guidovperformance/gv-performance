'use client'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const D = { fontFamily: "'Oswald', Impact, sans-serif" }
const B = { fontFamily: "'Barlow Condensed', sans-serif" }

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

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
export function BottomNav({ active }) {
  const items = [
    { href: '/dashboard/client',         id: 'home',    label: 'Home',     svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { href: '/dashboard/client/week',    id: 'week',    label: 'Week',     svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { href: '/dashboard/client/checkin', id: 'checkin', label: 'Check-in', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { href: '/dashboard/client/history', id: 'history', label: 'Voortgang',svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {items.map(item => {
        const isActive = active === item.id
        return (
          <a key={item.id} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 8px', color: isActive ? '#D4A857' : '#666', textDecoration: 'none', ...B }}>
            {item.svg}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

export function TopBar({ backHref, backLabel, showLogout }) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
  return (
    <header style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="18" height="16" viewBox="0 0 36 34"><polygon points="18,2 13,28 23,28" fill="#D4A857"/><polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5"/><polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5"/></svg>
        <span style={{ ...D, fontSize: 14, letterSpacing: '3px', fontWeight: 700, color: '#f0ede8' }}>GV PERFORMANCE</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {backHref && <a href={backHref} style={{ ...B, fontSize: 11, letterSpacing: '1px', color: '#666', textDecoration: 'none', textTransform: 'uppercase' }}>← {backLabel || 'Terug'}</a>}
        {showLogout && (
          <button onClick={handleSignOut} style={{ ...B, fontSize: 10, letterSpacing: '1px', color: '#555', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
            Uitloggen
          </button>
        )}
      </div>
    </header>
  )
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

  if (loading) return (
    <div style={{ background: '#141414', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 20, color: '#D4A857', letterSpacing: '3px' }}>
      LADEN...
    </div>
  )

  const DAYS = ['Ma','Di','Wo','Do','Vr','Za','Zo']
  const today = new Date().toISOString().split('T')[0]

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
          <a href="/dashboard/client/checkin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(212,168,87,0.08)', border: '1px solid rgba(212,168,87,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, textDecoration: 'none' }}>
            <div>
              <div style={{ ...D, fontSize: 14, fontWeight: 700, color: '#D4A857', letterSpacing: '0.5px' }}>Dagelijkse check-in</div>
              <div style={{ ...B, fontSize: 12, color: '#666' }}>Nog niet ingevuld vandaag</div>
            </div>
            <div style={{ background: '#D4A857', borderRadius: 8, padding: '8px 14px', ...B, fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Invullen</div>
          </a>
        )}

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
              <a href={`/dashboard/client/session/${data.todaySess.id}`} style={{ background: '#D4A857', borderRadius: 10, padding: '10px 18px', ...B, fontSize: 12, fontWeight: 700, color: '#000', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif" }}>Start →</a>
            </div>
            {data.todaySess.session_exercises?.slice(0,4).map((ex, i) => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ ...D, fontSize: 12, color: '#D4A857', fontWeight: 700, minWidth: 18 }}>{i+1}</span>
                <span style={{ ...B, fontSize: 13, flex: 1, color: '#f0ede8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exercises?.name}</span>
                <span style={{ ...B, fontSize: 11, color: '#555', flexShrink: 0 }}>{ex.sets}×{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#1e1e1e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '24px 18px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>😴</div>
            <div style={{ ...D, fontSize: 16, fontWeight: 700, color: '#f0ede8', marginBottom: 4 }}>Geen training vandaag</div>
            <div style={{ ...B, fontSize: 12, color: '#666', marginBottom: 14 }}>Hersteldag of coach plant binnenkort iets in.</div>
            <a href="/dashboard/client/week" style={{ ...B, fontSize: 11, color: '#D4A857', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif" }}>Bekijk weekschema →</a>
          </div>
        )}

        {/* Week strip */}
        <SectionLabel>Deze week</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {DAYS.map((day, i) => {
            const session = data?.weekSess?.find(s => s.day_of_week === i+1)
            const isToday = new Date().getDay() === (i === 6 ? 0 : i+1)
            return (
              <a key={day} href="/dashboard/client/week" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '9px 9px', borderRadius: 10, background: isToday ? '#D4A857' : '#1e1e1e', border: `1px solid ${isToday ? '#D4A857' : session ? 'rgba(212,168,87,0.3)' : 'rgba(255,255,255,0.06)'}`, minWidth: 40, flexShrink: 0, textDecoration: 'none' }}>
                <span style={{ ...B, fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: isToday ? '#000' : '#555', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>{day}</span>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isToday ? '#000' : session ? '#D4A857' : '#2a2a2a' }} />
              </a>
            )
          })}
        </div>

        {/* Coach feedback */}
        {data?.feedback?.length > 0 && (<>
          <SectionLabel>Coach feedback</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {data.feedback.map(f => (
              <div key={f.id} style={{ background: '#1e1e1e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #D4A857', padding: '14px 16px' }}>
                <div style={{ ...B, fontSize: 10, color: '#555', marginBottom: 5, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>{new Date(f.created_at).toLocaleDateString('nl-NL')}</div>
                <div style={{ ...B, fontSize: 14, lineHeight: 1.6, color: '#f0ede8' }}>{f.message}</div>
              </div>
            ))}
          </div>
        </>)}

        {/* Check-ins */}
        <SectionLabel>Check-ins</SectionLabel>
        {data?.recentCI?.length === 0 ? (
          <div style={{ background: '#1e1e1e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ ...B, fontSize: 13, color: '#666', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>Nog geen check-ins</div>
            <a href="/dashboard/client/checkin" style={{ ...B, fontSize: 11, color: '#D4A857', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif" }}>Eerste check-in →</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8 }}>
            {data.recentCI.map(c => (
              <div key={c.id} style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...B, fontSize: 12, color: '#666', fontFamily: "'Barlow Condensed', sans-serif" }}>{new Date(c.checkin_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {c.energy_level && <span style={{ ...B, fontSize: 12, color: '#f0ede8' }}>⚡{c.energy_level}</span>}
                  {c.mood && <span style={{ ...B, fontSize: 12, color: '#f0ede8' }}>😊{c.mood}</span>}
                  {c.morning_weight && <span style={{ ...D, fontSize: 13, fontWeight: 700, color: '#D4A857' }}>{c.morning_weight}kg</span>}
                </div>
              </div>
            ))}
            <a href="/dashboard/client/history" style={{ display: 'block', textAlign: 'center', padding: '12px', ...B, fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif" }}>Alle check-ins →</a>
          </div>
        )}
      </main>
      <BottomNav active="home" />
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#D4A857', textTransform: 'uppercase', marginBottom: 10 }}>
      <span style={{ display: 'block', width: 14, height: 2, background: '#D4A857', borderRadius: 1, flexShrink: 0 }}/>
      {children}
    </div>
  )
}

function TypeBadge({ type }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(212,168,87,0.1)', color: '#D4A857', border: '1px solid rgba(212,168,87,0.25)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
      {type}
    </span>
  )
}
