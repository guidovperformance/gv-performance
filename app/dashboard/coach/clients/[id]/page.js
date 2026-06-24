import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default async function ClientDetail({ params }) {
  const { id } = await params
  // Auth check via reguliere client (heeft cookie-sessie nodig)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Query zonder FK hint — simpelste form werkt het meest betrouwbaar
  const { data: client, error: clientError } = await supabaseAdmin
    .from('client_profiles')
    .select('*, profiles!client_profiles_user_id_fkey(full_name, email)')
    .eq('id', id)
    .maybeSingle()

  if (clientError) console.error('Client detail query error:', clientError)

  if (!client) {
    return (
      <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 22, color: '#D4A857', letterSpacing: 2, fontWeight: 700 }}>KLANT NIET GEVONDEN</div>
        <div style={{ fontSize: 13, color: '#888' }}>De klant kon niet worden geladen. Controleer of het account actief is.</div>
        <a href="/dashboard/coach" style={{ fontSize: 13, color: '#D4A857', textDecoration: 'underline', marginTop: 8 }}>← Terug naar coach dashboard</a>
      </div>
    )
  }

  const { data: testResults } = await supabaseAdmin
    .from('test_results')
    .select('*')
    .eq('client_id', id)
    .order('test_date', { ascending: false })

  const { data: checkIns } = await supabaseAdmin
    .from('daily_checkins')
    .select('*')
    .eq('client_id', id)
    .order('checkin_date', { ascending: false })
    .limit(10)

  const { data: macroPlan } = await supabaseAdmin
    .from('macro_plans')
    .select('*, meso_cycles(*, training_sessions(*))')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: sessionLogs } = await supabaseAdmin
    .from('session_logs')
    .select('*, training_sessions(session_name, session_type, session_date), exercise_logs(*, session_exercises(exercise_name))')
    .eq('client_id', id)
    .order('logged_at', { ascending: false })
    .limit(15)

  const naam = client.profiles?.full_name || 'Onbekend'
  const initialen = naam.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', ...B }}>

      {/* Header */}
      <header style={{ background: 'var(--dark2)', borderBottom: '1px solid rgba(212,168,87,0.12)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="26" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857" />
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5" />
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5" />
          </svg>
          <span style={{ ...D, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: 'var(--text)' }}>GV PERFORMANCE</span>
        </div>
        <a href="/dashboard/coach" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>← Alle klanten</a>
      </header>

      <main style={{ padding: 'clamp(16px, 4vw, 40px)' }}>

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

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
              <span style={{ display: 'block', width: 16, height: 2, background: 'var(--orange)' }} />
              <a href={`/dashboard/coach/clients/${id}/test`} style={{ color: 'inherit', textDecoration: 'none' }}>Laatste test</a>
            </div>
            {testResults && testResults.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{new Date(testResults[0].test_date).toLocaleDateString('nl-NL')}</div>
                  <a href={`/dashboard/coach/clients/${id}/test`} style={{ ...B, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', fontWeight: 700 }}>Alle testen →</a>
                </div>
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

        {/* Voltooide trainingen */}
        <div style={{ marginTop: 24 }}>
          <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 20, height: 2, background: 'var(--orange)' }} />Voltooide trainingen
          </div>
          {sessionLogs && sessionLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessionLogs.map(log => {
                const sess = log.training_sessions
                const exLogs = log.exercise_logs || []
                const grouped = exLogs.reduce((acc, e) => {
                  const name = e.session_exercises?.exercise_name || 'Oefening'
                  if (!acc[name]) acc[name] = []
                  acc[name].push(e)
                  return acc
                }, {})
                return (
                  <div key={log.id} style={{ background: 'var(--dark2)', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ ...D, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{sess?.session_name || 'Training'}</div>
                        <div style={{ ...B, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {sess?.session_date ? new Date(sess.session_date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}
                          {sess?.session_type ? ` · ${sess.session_type}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 14 }}>
                        {log.rpe && <div style={{ textAlign: 'center' }}><div style={{ ...B, fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>RPE</div><div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--orange)' }}>{log.rpe}</div></div>}
                        {log.feeling && <div style={{ textAlign: 'center' }}><div style={{ ...B, fontSize: 9, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>Gevoel</div><div style={{ ...D, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{log.feeling}</div></div>}
                      </div>
                    </div>

                    {log.notes && (
                      <div style={{ background: 'var(--dark3)', borderLeft: '2px solid var(--orange)', padding: '10px 14px', marginBottom: 12, ...B, fontSize: 13, color: 'var(--text)', fontStyle: 'italic' }}>
                        💬 {log.notes}
                      </div>
                    )}

                    {Object.keys(grouped).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Object.entries(grouped).map(([name, sets]) => (
                          <div key={name} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <span style={{ ...B, fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 140 }}>{name}</span>
                            <span style={{ ...B, fontSize: 12, color: 'var(--muted)' }}>
                              {sets.sort((a,b)=>(a.set_number||0)-(b.set_number||0)).map(s => `${s.reps_performed ?? '—'}${s.weight_kg ? `×${s.weight_kg}kg` : ''}`).join(' · ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ background: 'var(--dark2)', padding: 32, textAlign: 'center', ...B, fontSize: 14, color: 'var(--muted)' }}>
              Nog geen voltooide trainingen van deze klant
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
