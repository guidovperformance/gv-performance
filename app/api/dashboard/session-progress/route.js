import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Haalt de bestaande log op voor een sessie (indien aanwezig) + "vorige keer"
 * waarden per oefening, op basis van exercise_name. Loopt via supabaseAdmin
 * i.p.v. directe client-select, consistent met de rest van dit project
 * (voorkomt RLS-gaten op session_logs/exercise_logs die nooit eerder vanaf
 * de klant-kant gelezen werden).
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return Response.json({ error: 'session_id ontbreekt' }, { status: 400 })

    const { data: clientProfile } = await supabaseAdmin
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!clientProfile) return Response.json({ error: 'Geen klantprofiel gevonden' }, { status: 403 })

    const { data: session } = await supabaseAdmin
      .from('training_sessions')
      .select('id, client_id')
      .eq('id', sessionId)
      .maybeSingle()
    if (!session || session.client_id !== clientProfile.id) {
      return Response.json({ error: 'Deze sessie hoort niet bij jouw account' }, { status: 403 })
    }

    const { data: sessionLog } = await supabaseAdmin
      .from('session_logs')
      .select('*, exercise_logs(*)')
      .eq('session_id', sessionId)
      .maybeSingle()

    // "Vorige keer"-historie: laatste keer dat de klant elke oefening (op
    // naam) deed, uit een ANDERE sessie, met een ingevulde waarde.
    const { data: history } = await supabaseAdmin
      .from('exercise_logs')
      .select('weight_kg, reps_performed, session_exercises(exercise_name), session_logs!inner(session_id, logged_at, client_id)')
      .eq('session_logs.client_id', clientProfile.id)
      .not('weight_kg', 'is', null)
      .order('logged_at', { foreignTable: 'session_logs', ascending: false })

    const previous = {}
    for (const row of history || []) {
      const name = row.session_exercises?.exercise_name
      const otherSession = row.session_logs?.session_id !== sessionId
      if (!name || !otherSession) continue
      if (!previous[name]) {
        previous[name] = { weight_kg: row.weight_kg, reps_performed: row.reps_performed, logged_at: row.session_logs.logged_at }
      }
    }

    return Response.json({ session_log: sessionLog || null, previous })
  } catch (e) {
    console.error('Get session progress exception:', e)
    return Response.json({ error: 'Serverfout bij ophalen' }, { status: 500 })
  }
}

/**
 * Tussentijdse autosave tijdens een training: upsert (op session_id) met
 * status='in_uitvoering'. Wordt niet aangeroepen ná voltooien — de
 * save-session-log-route is dan leidend en zet status op 'voltooid'.
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const body = await request.json()
    const { session_id, rpe, notes, current_exercise_id, sets } = body
    if (!session_id) return Response.json({ error: 'session_id ontbreekt' }, { status: 400 })

    const { data: clientProfile } = await supabaseAdmin
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!clientProfile) return Response.json({ error: 'Geen klantprofiel gevonden' }, { status: 403 })

    const { data: session } = await supabaseAdmin
      .from('training_sessions')
      .select('id, client_id, status')
      .eq('id', session_id)
      .maybeSingle()

    if (!session || session.client_id !== clientProfile.id) {
      return Response.json({ error: 'Deze sessie hoort niet bij jouw account' }, { status: 403 })
    }

    // Een reeds voltooide sessie wordt door autosave niet teruggezet naar
    // 'in_uitvoering' — bewerken van een voltooide sessie loopt via
    // save-session-log, dat expliciet status='voltooid' blijft zetten.
    if (session.status === 'voltooid') {
      return Response.json({ error: 'Sessie is al voltooid' }, { status: 409 })
    }

    const { data: sessionLog, error: logError } = await supabaseAdmin
      .from('session_logs')
      .upsert({
        client_id: clientProfile.id,
        session_id,
        logged_at: new Date().toISOString(),
        rpe: rpe || null,
        notes: notes || null,
        status: 'in_uitvoering',
        current_exercise_id: current_exercise_id || null,
      }, { onConflict: 'session_id' })
      .select()
      .single()

    if (logError) {
      console.error('session_logs autosave upsert error:', logError)
      return Response.json({ error: logError.message }, { status: 400 })
    }

    if (Array.isArray(sets) && sets.length > 0) {
      const rows = sets.map(s => ({
        session_log_id: sessionLog.id,
        session_exercise_id: s.session_exercise_id,
        set_number: s.set_number,
        reps_performed: s.reps_performed ?? null,
        weight_kg: s.weight_kg ?? null,
        completed: s.completed ?? false,
      }))
      const { error: exError } = await supabaseAdmin
        .from('exercise_logs')
        .upsert(rows, { onConflict: 'session_log_id,session_exercise_id,set_number' })
      if (exError) {
        console.error('exercise_logs autosave upsert error:', exError)
        return Response.json({ error: exError.message }, { status: 400 })
      }
    }

    if (session.status === 'gepland') {
      await supabaseAdmin.from('training_sessions').update({ status: 'in_uitvoering' }).eq('id', session_id)
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('Save session progress exception:', e)
    return Response.json({ error: 'Serverfout bij tussentijds opslaan' }, { status: 500 })
  }
}
