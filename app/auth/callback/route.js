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
    console.error('exchangeCodeForSession error:', error)
  }

  // Stroom 2: token_hash — probeer origineel type, dan magiclink als fallback
  if (token_hash && type) {
    // Eerste poging: type zoals Supabase stuurt (invite / recovery / email)
    const { error: err1 } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!err1) return NextResponse.redirect(`${origin}${next}`)
    console.error('verifyOtp attempt 1 error:', err1)

    // Tweede poging: nieuwere Supabase versies willen 'magiclink' voor invite
    if (type === 'invite') {
      const { error: err2 } = await supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })
      if (!err2) return NextResponse.redirect(`${origin}${next}`)
      console.error('verifyOtp attempt 2 (magiclink) error:', err2)
    }

    // Derde poging: email (voor recovery flows)
    if (type === 'recovery') {
      const { error: err3 } = await supabase.auth.verifyOtp({ token_hash, type: 'email' })
      if (!err3) return NextResponse.redirect(`${origin}${next}`)
      console.error('verifyOtp attempt 3 (email) error:', err3)
    }
  }

  // Alles mislukt
  return NextResponse.redirect(`${origin}/login?error=invite_failed`)
}
