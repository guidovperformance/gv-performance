import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'coach') return Response.json({ error: 'Geen toegang' }, { status: 403 })

    const { naam, email, sport, doel, geboortedatum, notities } = await request.json()
    if (!naam?.trim() || !email?.trim()) {
      return Response.json({ error: 'Naam en email zijn verplicht.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
    }

    // Gebruik altijd www.gvperformance.nl — consistent met Supabase allowlist
    const siteUrl = 'https://www.gvperformance.nl'

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.toLowerCase().trim(),
      {
        data: { full_name: naam.trim(), role: 'client' },
        redirectTo: `${siteUrl}/auth/callback?next=/auth/set-password`,
      }
    )

    if (inviteError) {
      if (inviteError.message?.includes('already registered')) {
        return Response.json({ error: 'Dit e-mailadres heeft al een account.' }, { status: 400 })
      }
      return Response.json({ error: inviteError.message }, { status: 400 })
    }

    const userId = inviteData.user.id

    await supabaseAdmin.from('profiles').upsert(
      { id: userId, full_name: naam.trim(), role: 'client', email: email.toLowerCase().trim() },
      { onConflict: 'id' }
    )

    const { error: profileError } = await supabaseAdmin.from('client_profiles').insert({
      user_id: userId,
      coach_id: user.id,
      sport: sport?.trim() || null,
      goal: doel?.trim() || null,
      date_of_birth: geboortedatum || null,
      notes: notities?.trim() || null,
    })

    if (profileError) {
      console.error('Client profile error:', profileError)
      return Response.json({ error: `Profiel aanmaken mislukt: ${profileError.message}` }, { status: 500 })
    }

    return Response.json({ success: true, userId })
  } catch (error) {
    console.error('Create client error:', error)
    return Response.json({ error: 'Er ging iets mis. Probeer opnieuw.' }, { status: 500 })
  }
}
