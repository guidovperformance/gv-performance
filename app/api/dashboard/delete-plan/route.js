import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { planId } = await request.json()
    if (!planId) return Response.json({ error: 'planId ontbreekt' }, { status: 400 })

    // 1. Haal alle meso_cycles op
    const { data: mesos } = await supabaseAdmin
      .from('meso_cycles').select('id').eq('macro_plan_id', planId)

    for (const meso of mesos || []) {
      // 2. Haal alle sessies op per meso
      const { data: sessions } = await supabaseAdmin
        .from('training_sessions').select('id').eq('meso_cycle_id', meso.id)

      for (const sess of sessions || []) {
        // 3. Verwijder exercise_logs via session_exercises
        const { data: exs } = await supabaseAdmin
          .from('session_exercises').select('id').eq('session_id', sess.id)

        for (const ex of exs || []) {
          await supabaseAdmin.from('exercise_logs').delete().eq('session_exercise_id', ex.id)
        }

        // 4. Verwijder session_exercises en session_logs
        await supabaseAdmin.from('session_exercises').delete().eq('session_id', sess.id)
        await supabaseAdmin.from('session_logs').delete().eq('session_id', sess.id)
      }

      // 5. Verwijder sessies en meso
      await supabaseAdmin.from('training_sessions').delete().eq('meso_cycle_id', meso.id)
      await supabaseAdmin.from('meso_cycles').delete().eq('id', meso.id)
    }

    // 6. Verwijder het macro plan zelf
    const { error } = await supabaseAdmin.from('macro_plans').delete().eq('id', planId)
    if (error) {
      console.error('Delete plan error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('Delete plan exception:', e)
    return Response.json({ error: 'Serverfout bij verwijderen' }, { status: 500 })
  }
}
