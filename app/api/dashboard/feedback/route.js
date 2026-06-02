import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { client_id, reference_id, feedback_type, message } = await request.json()
    if (!message || !client_id) return Response.json({ error: 'Bericht en klant zijn verplicht' }, { status: 400 })

    const { error } = await supabaseAdmin.from('coach_feedback').insert({
      coach_id: user.id,
      client_id,
      reference_id: reference_id || null,
      feedback_type: feedback_type || 'checkin',
      message,
    })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (e) {
    return Response.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const referenceId = searchParams.get('reference_id')

    let query = supabaseAdmin.from('coach_feedback').select('*').order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    if (referenceId) query = query.eq('reference_id', referenceId)

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ feedback: data })
  } catch (e) {
    return Response.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
