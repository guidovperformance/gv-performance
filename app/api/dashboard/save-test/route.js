import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const body = await request.json()
    if (!body.client_id) return Response.json({ error: 'client_id ontbreekt' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('test_results')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Test save error:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ success: true, id: data.id })
  } catch (e) {
    console.error('Save test exception:', e)
    return Response.json({ error: 'Serverfout' }, { status: 500 })
  }
}
