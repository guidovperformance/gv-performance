import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Correcte role-based redirect
  if (profile?.role === 'coach') redirect('/dashboard/coach')
  if (profile?.role === 'client') redirect('/dashboard/client')

  // FIXED: geen profiel gevonden → toon wacht-pagina i.p.v. coach dashboard
  // Dit kan bij nieuwe gebruikers waar de trigger nog bezig is
  if (error || !profile) {
    // Wacht even en probeer opnieuw via client-side redirect
    redirect('/dashboard/wachten')
  }

  redirect('/dashboard/coach')
}
