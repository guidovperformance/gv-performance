import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')
  const next       = searchParams.get('next') ?? '/auth/set-password'

  const supabase = await createClient()

  // Stroom 1: PKCE code (ook pkce_ token_hash valt hieronder)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('exchangeCodeForSession error:', error)
  }

  // Stroom 2: token_hash met pkce_ prefix → ook exchangeCodeForSession
  if (token_hash && token_hash.startsWith('pkce_')) {
    const { error } = await supabase.auth.exchangeCodeForSession(token_hash)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('exchangeCodeForSession (pkce token_hash) error:', error)
  }

  // Stroom 3: gewone OTP token_hash (invite / recovery / email)
  if (token_hash && type && !token_hash.startsWith('pkce_')) {
    const typesToTry = [type]
    if (type === 'invite') typesToTry.push('magiclink')
    if (type === 'recovery') typesToTry.push('email')

    for (const t of typesToTry) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: t })
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error(`verifyOtp type=${t} error:`, error)
    }
  }

  // Alles mislukt
  return NextResponse.redirect(`${origin}/login?error=invite_failed`)
}
