import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const body = await request.json()
    const { session_id, rpe, notes, sets } = body
    if (!session_id) return Response.json({ error: 'session_id ontbreekt' }, { status: 400 })

    // Eigendom verifiëren: dit moet de client zijn van wie de sessie is
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
      .insert({
        client_id: clientProfile.id,
        session_id,
        logged_at: new Date().toISOString(),
        rpe: rpe || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (logError) {
      console.error('session_logs insert error:', logError)
      return Response.json({ error: logError.message }, { status: 400 })
    }

    if (Array.isArray(sets) && sets.length > 0) {
      const rows = sets.map(s => ({
        session_log_id: sessionLog.id,
        session_exercise_id: s.session_exercise_id,
        set_number: s.set_number,
        reps_performed: s.reps_performed ?? null,
        weight_kg: s.weight_kg ?? null,
      }))
      const { error: exError } = await supabaseAdmin.from('exercise_logs').insert(rows)
      if (exError) {
        console.error('exercise_logs insert error:', exError)
        // sessie-log staat al vast; oefeningdetails mislukt — toch succes melden maar loggen
      }
    }

    return Response.json({ success: true, id: sessionLog.id })
  } catch (e) {
    console.error('Save session log exception:', e)
    return Response.json({ error: 'Serverfout bij opslaan' }, { status: 500 })
  }
}
