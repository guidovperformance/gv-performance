import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Gebruik admin client om RLS te omzeilen
  const { data: clients } = await supabaseAdmin
    .from('client_profiles')
    .select('id, sport, goal, profiles(full_name, email)')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const { data: recentCheckins } = await supabaseAdmin
    .from('daily_checkins')
    .select('id, checkin_date, energy_level, mood, morning_weight, notes, client_profiles(profiles(full_name))')
    .order('checkin_date', { ascending: false })
    .limit(5)

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(255,77,0,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
            <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
          <span style={{ ...B, fontSize: 11, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase' }}>Coach</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/dashboard/coach/clients/new" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#000', background: 'var(--orange)', padding: '8px 18px', textDecoration: 'none', fontWeight: 700 }}>+ Klant toevoegen</a>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Uitloggen</button>
          </form>
        </div>
      </header>

      <main style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginBottom: 40 }}>
          {[
            { label: 'Actieve klanten', value: clients?.length || 0, icon: '👥' },
            { label: 'Check-ins vandaag', value: recentCheckins?.filter(c => c.checkin_date === new Date().toISOString().split('T')[0]).length || 0, icon: '📊' },
            { label: 'Openstaande feedback', value: '—', icon: '💬' },
            { label: 'Trainingen deze week', value: '—', icon: '🏋️' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--dark2)', padding: '24px 28px' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ ...D, fontSize: 36, fontWeight: 700, color: 'var(--orange)', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ ...B, fontSize: 12, color: 'var(--muted)', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: 'var(--orange)' }} />Mijn klanten
            </div>
            {!clients || clients.length === 0 ? (
              <div style={{ background: 'var(--dark2)', padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
                <div style={{ ...D, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Nog geen klanten</div>
                <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Voeg je eerste klant toe om te beginnen.</div>
                <a href="/dashboard/coach/clients/new" style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 24px', textDecoration: 'none' }}>Klant toevoegen</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {clients.map(client => (
                  <a key={client.id} href={`/dashboard/coach/clients/${client.id}`} style={{ background: 'var(--dark2)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', borderLeft: '3px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, background: 'var(--orange-dim)', border: '1px solid rgba(255,77,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)' }}>
                        {client.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ ...D, fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>{client.profiles?.full_name || 'Onbekend'}</div>
                        <div style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>{client.sport || '—'} · {client.goal || '—'}</div>
                      </div>
                    </div>
                    <div style={{ ...B, fontSize: 11, letterSpacing: 2, color: 'var(--orange)', textTransform: 'uppercase' }}>Bekijken →</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: 'var(--orange)' }} />Recente check-ins
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!recentCheckins || recentCheckins.length === 0 ? (
                <div style={{ background: 'var(--dark2)', padding: 24, textAlign: 'center', ...B, fontSize: 13, color: 'var(--muted)' }}>Nog geen check-ins</div>
              ) : recentCheckins.map(c => (
                <div key={c.id} style={{ background: 'var(--dark2)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ ...D, fontSize: 15, fontWeight: 700 }}>{c.client_profiles?.profiles?.full_name}</div>
                    <div style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{new Date(c.checkin_date).toLocaleDateString('nl-NL')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {c.energy_level && <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>⚡ {c.energy_level}/5</span>}
                    {c.mood && <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>😊 {c.mood}/5</span>}
                    {c.morning_weight && <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>⚖️ {c.morning_weight}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
