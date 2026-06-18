import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')
  const next       = searchParams.get('next') ?? '/auth/set-password'

  const supabase = await createClient()

  // Stroom 1: OAuth / magic link via PKCE code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  // Stroom 2: Invite email / email confirm via token_hash
  // Supabase stuurt dit formaat bij inviteUserByEmail
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('verifyOtp error:', error)
  }

  // Alles mislukt — terug naar login met foutmelding
  return NextResponse.redirect(`${origin}/login?error=invite_failed`)
}
