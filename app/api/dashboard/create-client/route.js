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

    // Stap 1: Invite aanmaken
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: naam, role: 'client' },
      redirectTo: 'https://gvperformance.nl/auth/confirm',
    })

    if (inviteError) return Response.json({ error: inviteError.message }, { status: 400 })

    const userId = inviteData.user.id

    // Stap 2: Forceer role='client' via directe SQL — ongeacht wat de trigger deed
    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'client', full_name: naam })
      .eq('id', userId)

    // Als update mislukt (profiel nog niet aangemaakt door trigger), insert het
    if (roleError) {
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: email,
        full_name: naam,
        role: 'client',
      })
    }

    // Stap 3: Klantprofiel aanmaken
    const { error: profileError } = await supabaseAdmin
      .from('client_profiles')
      .insert({
        user_id: userId,
        coach_id: user.id,
        sport: sport || null,
        goal: doel || null,
        date_of_birth: geboortedatum || null,
        notes: notities || null,
      })

    if (profileError) return Response.json({ error: `Profiel mislukt: ${profileError.message}` }, { status: 500 })

    return Response.json({ success: true, userId })

  } catch (error) {
    console.error('Create client error:', error)
    return Response.json({ error: 'Er ging iets mis.' }, { status: 500 })
  }
}
