import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { client_id, hrv_baseline } = await request.json()
    if (!client_id) return Response.json({ error: 'Klant is verplicht' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('client_profiles')
      .update({ hrv_baseline: hrv_baseline ? parseFloat(hrv_baseline) : null })
      .eq('id', client_id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (e) {
    return Response.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
