import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Rondt een training af: upsert (op session_id) i.p.v. blind insert, zodat
 * hervatten van een 'in_uitvoering' sessie dezelfde rij bijwerkt in plaats
 * van een duplicaat aan te maken. Zet status op 'voltooid' op zowel
 * session_logs als training_sessions.
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const body = await request.json()
    const { session_id, rpe, notes, sets } = body
    if (!session_id) return Response.json({ error: 'session_id ontbreekt' }, { status: 400 })

    const { data: clientProfile } = await supabaseAdmin
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!clientProfile) return Response.json({ error: 'Geen klantprofiel gevonden' }, { status: 403 })

    const { data: session } = await supabaseAdmin
      .from('training_sessions')
      .select('id, client_id')
      .eq('id', session_id)
      .maybeSingle()

    if (!session || session.client_id !== clientProfile.id) {
      return Response.json({ error: 'Deze sessie hoort niet bij jouw account' }, { status: 403 })
    }

    const { data: sessionLog, error: logError } = await supabaseAdmin
      .from('session_logs')
      .upsert({
        client_id: clientProfile.id,
        session_id,
        logged_at: new Date().toISOString(),
        rpe: rpe || null,
        notes: notes || null,
        status: 'voltooid',
        current_exercise_id: null,
      }, { onConflict: 'session_id' })
      .select()
      .single()

    if (logError) {
      console.error('session_logs upsert error:', logError)
      return Response.json({ error: logError.message }, { status: 400 })
    }

    if (Array.isArray(sets) && sets.length > 0) {
      const rows = sets.map(s => ({
        session_log_id: sessionLog.id,
        session_exercise_id: s.session_exercise_id,
        set_number: s.set_number,
        reps_performed: s.reps_performed ?? null,
        weight_kg: s.weight_kg ?? null,
        completed: s.completed ?? true,
      }))
      const { error: exError } = await supabaseAdmin
        .from('exercise_logs')
        .upsert(rows, { onConflict: 'session_log_id,session_exercise_id,set_number' })
      if (exError) {
        console.error('exercise_logs upsert error:', exError)
      }
    }

    await supabaseAdmin.from('training_sessions').update({ status: 'voltooid' }).eq('id', session_id)

    return Response.json({ success: true, id: sessionLog.id })
  } catch (e) {
    console.error('Save session log exception:', e)
    return Response.json({ error: 'Serverfout bij opslaan' }, { status: 500 })
  }
}
