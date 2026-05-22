import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { naam, email, sport, doel, geboortedatum, notities } = await request.json()
    if (!naam || !email) return Response.json({ error: 'Naam en email zijn verplicht.' }, { status: 400 })

    // Stuur uitnodiging
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: naam, role: 'client' },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gvperformance.nl'}/dashboard`,
    })

    if (inviteError) return Response.json({ error: inviteError.message }, { status: 400 })

    const userId = inviteData.user.id

    // Maak profiel aan (of update als trigger het al aangemaakt heeft)
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: naam,
        role: 'client',
        email: email,
      }, { onConflict: 'id' })

    if (profileUpsertError) {
      console.error('Profile upsert error:', profileUpsertError)
    }

    // Maak klantprofiel aan
    const { error: clientProfileError } = await supabaseAdmin
      .from('client_profiles')
      .insert({
        user_id: userId,
        coach_id: user.id,
        sport: sport || null,
        goal: doel || null,
        date_of_birth: geboortedatum || null,
        notes: notities || null,
      })

    if (clientProfileError) {
      console.error('Client profile error:', clientProfileError)
      return Response.json({ error: `Profiel mislukt: ${clientProfileError.message}` }, { status: 500 })
    }

    return Response.json({ success: true, userId })

  } catch (error) {
    console.error('Create client error:', error)
    return Response.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
