import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabaseAdmin
    .from('client_profiles')
    .select('id, sport, goal, created_at, profiles!client_profiles_user_id_fkey(full_name, email)')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  const { data: recentCheckins } = await supabaseAdmin
    .from('daily_checkins')
    .select('id, checkin_date, energy_level, mood, morning_weight, notes, client_id, client_profiles(profiles!client_profiles_user_id_fkey(full_name))')
    .in('client_id', clients?.map(c => c.id) || [])
    .order('checkin_date', { ascending: false })
    .limit(8)

  const todayCheckins = recentCheckins?.filter(c => c.checkin_date === today).length || 0

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', fontFamily: 'var(--font-barlow), sans-serif' }}>

      {/* Header */}
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid var(--border)', padding: '14px clamp(16px,4vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="22" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857"/>
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5"/>
          </svg>
          <span style={{ ...D, fontSize: 16, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
          <span className="badge badge-orange" style={{ display: 'none', fontFamily: 'var(--font-barlow), sans-serif' }}>Coach</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/dashboard/coach/clients/new" style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', padding: '8px 18px', ...B, fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>+ Klant</a>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Uit</button>
          </form>
        </div>
      </header>

      <main style={{ padding: 'clamp(16px,4vw,40px)' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 24 }}>
          {[
            { icon: '👥', value: clients?.length || 0, label: 'Klanten' },
            { icon: '✅', value: todayCheckins, label: 'Check-ins vandaag' },
            { icon: '📊', value: recentCheckins?.length || 0, label: 'Recente meldingen' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: '18px 16px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ ...D, fontSize: 32, fontWeight: 700, color: 'var(--orange)', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ ...B, fontSize: 11, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Eigen trainingsplan */}
        <div style={{ marginBottom: 24 }}>
          <a href="/dashboard/coach/eigen-training" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid rgba(61,255,160,0.2)', padding: '18px 20px', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, background: 'rgba(61,255,160,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏋️</div>
              <div>
                <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>EIGEN TRAININGSPLAN</div>
                <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>Mega Fit Schema 2026 · HRV · Tests · Schema</div>
              </div>
            </div>
            <div style={{ ...B, fontSize: 11, color: '#3dffa0', fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>Openen →</div>
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24 }}>

          {/* Klanten */}
          <div>
            <div className="section-label">Mijn klanten</div>
            {!clients || clients.length === 0 ? (
              <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div style={{ ...D, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Nog geen klanten</div>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Voeg je eerste klant toe om te beginnen.</div>
                <a href="/dashboard/coach/clients/new" style={{ background: 'var(--orange)', borderRadius: 'var(--r-btn)', padding: '12px 24px', ...B, fontSize: 12, fontWeight: 700, color: '#000', letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>Klant toevoegen</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {clients.map(client => {
                  const naam = client.profiles?.full_name || 'Onbekend'
                  const initialen = naam.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                  const heeftCI = recentCheckins?.some(c => c.client_id === client.id && c.checkin_date === today)
                  return (
                    <a key={client.id} href={`/dashboard/coach/clients/${client.id}`}
                      style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: `1px solid ${heeftCI ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                      <div style={{ width: 40, height: 40, background: 'var(--orange-dim)', border: '1px solid var(--border-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 14, fontWeight: 700, color: 'var(--orange)', flexShrink: 0 }}>{initialen}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...D, fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.5 }}>{naam}</div>
                        <div style={{ ...B, fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.sport || '—'}{client.goal ? ` · ${client.goal}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {heeftCI && <span style={{ fontSize: 8, padding: '3px 8px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', color: '#4ade80', ...B, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>✓ CI</span>}
                        <span style={{ ...B, fontSize: 11, color: 'var(--orange)', fontWeight: 700 }}>→</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recente check-ins */}
          <div>
            <div className="section-label">Check-ins</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {!recentCheckins || recentCheckins.length === 0 ? (
                <div style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--border)', padding: 24, textAlign: 'center', ...B, fontSize: 13, color: 'var(--muted)' }}>Nog geen check-ins</div>
              ) : recentCheckins.map(ci => (
                <div key={ci.id} style={{ background: 'var(--card)', borderRadius: 12, border: `1px solid ${ci.checkin_date === today ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ ...D, fontSize: 13, fontWeight: 700 }}>{ci.client_profiles?.profiles?.full_name?.split(' ')[0] || '—'}</div>
                    <div style={{ ...B, fontSize: 10, color: ci.checkin_date === today ? '#4ade80' : 'var(--muted)' }}>{ci.checkin_date === today ? 'Vandaag' : new Date(ci.checkin_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {ci.energy_level && <span style={{ ...B, fontSize: 12 }}>⚡{ci.energy_level}</span>}
                    {ci.mood && <span style={{ ...B, fontSize: 12 }}>😊{ci.mood}</span>}
                    {ci.morning_weight && <span style={{ ...D, fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>{ci.morning_weight}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <style>{`@media(max-width:700px){main > div:last-child{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
