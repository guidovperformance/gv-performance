import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Probeer profiel op te halen
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'coach') redirect('/dashboard/coach')
  if (profile?.role === 'client') redirect('/dashboard/client')

  // Geen profiel gevonden — kijk in auth metadata als fallback
  const role = user.user_metadata?.role || user.raw_user_meta_data?.role

  if (role === 'coach') redirect('/dashboard/coach')
  if (role === 'client') redirect('/dashboard/client')

  // Absolute fallback — stuur naar coach als laatste optie
  // (voorkomt redirect loop met /login)
  redirect('/dashboard/coach')
}
