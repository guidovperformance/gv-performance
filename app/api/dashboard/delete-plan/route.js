import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { testId } = await request.json()
    if (!testId) return Response.json({ error: 'testId ontbreekt' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('test_results')
      .delete()
      .eq('id', testId)

    if (error) {
      console.error('Delete test error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('Delete test exception:', e)
    return Response.json({ error: 'Serverfout' }, { status: 500 })
  }
}
