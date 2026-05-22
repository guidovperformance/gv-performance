import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default async function ClientDetail({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('client_profiles')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single()

  if (!client) redirect('/dashboard/coach')

  const { data: testResults } = await supabase
    .from('test_results')
    .select('*')
    .eq('client_id', id)
    .order('test_date', { ascending: false })

  const { data: checkIns } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('client_id', id)
    .order('checkin_date', { ascending: false })
    .limit(10)

  const { data: macroPlan } = await supabase
    .from('macro_plans')
    .select('*, meso_cycles(*, training_sessions(*))')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const naam = client.profiles?.full_name || 'Onbekend'
  const initialen = naam.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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
        <a href="/dashboard/coach" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Alle klanten</a>
      </header>

      <main style={{ padding: '40px' }}>

        {/* Client header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, background: 'var(--orange-dim)', border: '2px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...D, fontSize: 24, fontWeight: 700, color: 'var(--orange)', flexShrink: 0 }}>
              {initialen}
            </div>
            <div>
              <h1 style={{ ...D, fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 700, letterSpacing: 1, lineHeight: 1, marginBottom: 6 }}>{naam.toUpperCase()}</h1>
              <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>{client.sport || 'Sport niet opgegeven'} · {client.profiles?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={`/dashboard/coach/clients/${id}/plan/new`} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none' }}>
              + Trainingsplan
            </a>
            <a href={`/dashboard/coach/clients/${id}/test/new`} style={{ border: '1px solid var(--muted2)', color: 'var(--text)', ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none' }}>
              + Testresultaat
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

          {/* Profiel */}
          <div style={{ background: 'var(--dark2)', padding: 28 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', width: 16, height: 2, background: 'var(--orange)' }} />Profiel
            </div>
            {[
              ['Doel', client.goal || '—'],
              ['Sport', client.sport || '—'],
              ['Geboortedatum', client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString('nl-NL') : '—'],
              ['Email', client.profiles?.email || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ ...B, fontSize: 14, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
            {client.notes && (
              <div style={{ marginTop: 8 }}>
                <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Notities</div>
                <div style={{ ...B, fontSize: 13, color: '#aaa', lineHeight: 1.6, fontStyle: 'italic' }}>{client.notes}</div>
              </div>
            )}
          </div>

          {/* Huidig plan */}
          <div style={{ background: 'var(--dark2)', padding: 28 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', width: 16, height: 2, background: 'var(--orange)' }} />Huidig plan
            </div>
            {macroPlan ? (
              <>
                <div style={{ ...D, fontSize: 20, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{macroPlan.name}</div>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{macroPlan.goal}</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Start</div>
                    <div style={{ ...B, fontSize: 13 }}>{macroPlan.start_date ? new Date(macroPlan.start_date).toLocaleDateString('nl-NL') : '—'}</div>
                  </div>
                  <div>
                    <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Einde</div>
                    <div style={{ ...B, fontSize: 13 }}>{macroPlan.end_date ? new Date(macroPlan.end_date).toLocaleDateString('nl-NL') : '—'}</div>
                  </div>
                </div>
                <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{macroPlan.meso_cycles?.length || 0} weken gepland</div>
                <a href={`/dashboard/coach/clients/${id}/plan/${macroPlan.id}`} style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>
                  Plan bekijken →
                </a>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Nog geen trainingsplan</div>
                <a href={`/dashboard/coach/clients/${id}/plan/new`} style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none' }}>Plan aanmaken</a>
              </div>
            )}
          </div>

          {/* Laatste testresultaten */}
          <div style={{ background: 'var(--dark2)', padding: 28 }}>
            <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', width: 16, height: 2, background: 'var(--orange)' }} />Laatste test
            </div>
            {testResults && testResults.length > 0 ? (
              <>
                <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>{new Date(testResults[0].test_date).toLocaleDateString('nl-NL')}</div>
                {[
                  ['Gewicht', testResults[0].weight_kg ? `${testResults[0].weight_kg} kg` : null],
                  ['VO2max', testResults[0].vo2max ? `${testResults[0].vo2max} ml/kg/min` : null],
                  ['Rust HR', testResults[0].resting_hr ? `${testResults[0].resting_hr} bpm` : null],
                  ['Squat 1RM', testResults[0].squat_1rm ? `${testResults[0].squat_1rm} kg` : null],
                  ['Deadlift 1RM', testResults[0].deadlift_1rm ? `${testResults[0].deadlift_1rm} kg` : null],
                  ['Bench 1RM', testResults[0].bench_1rm ? `${testResults[0].bench_1rm} kg` : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ ...B, fontSize: 13, color: 'var(--muted)' }}>{label}</span>
                    <span style={{ ...D, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ ...B, fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Nog geen testresultaten</div>
                <a href={`/dashboard/coach/clients/${id}/test/new`} style={{ ...B, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>Test invoeren →</a>
              </div>
            )}
          </div>

        </div>

        {/* Check-ins */}
        <div style={{ marginTop: 24 }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 20, height: 2, background: 'var(--orange)' }} />Recente check-ins
          </div>
          {checkIns && checkIns.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
              {checkIns.slice(0, 10).map(c => (
                <div key={c.id} style={{ background: 'var(--dark2)', padding: '20px 24px' }}>
                  <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{new Date(c.checkin_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {c.energy_level && <span style={{ ...B, fontSize: 11, color: 'var(--orange)' }}>⚡{c.energy_level}</span>}
                    {c.mood && <span style={{ ...B, fontSize: 11, color: 'var(--orange)' }}>😊{c.mood}</span>}
                    {c.sleep_quality && <span style={{ ...B, fontSize: 11, color: 'var(--orange)' }}>💤{c.sleep_quality}</span>}
                  </div>
                  {c.morning_weight && <div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{c.morning_weight} kg</div>}
                  {c.notes && <div style={{ ...B, fontSize: 11, color: 'var(--muted)', marginTop: 6, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&ldquo;{c.notes}&rdquo;</div>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--dark2)', padding: 32, textAlign: 'center', ...B, fontSize: 14, color: 'var(--muted)' }}>
              Nog geen check-ins van deze klant
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
