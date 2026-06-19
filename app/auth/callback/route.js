import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')
  const next       = searchParams.get('next') ?? '/auth/set-password'

  const supabase = await createClient()

  // Stroom 1: code via PKCE (standaard OAuth + nieuwere Supabase invite flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // Stroom 2: token_hash (OTP flow — invite, recovery, email)
  if (token_hash && type) {
    // Probeer het opgegeven type eerst
    const { error: e1 } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!e1) return NextResponse.redirect(`${origin}${next}`)
    console.error(`[auth/callback] verifyOtp type=${type} error:`, e1.message)

    // Fallbacks
    const fallbacks = []
    if (type === 'invite')   fallbacks.push('magiclink', 'signup')
    if (type === 'recovery') fallbacks.push('email', 'magiclink')
    if (type === 'magiclink') fallbacks.push('invite')

    for (const t of fallbacks) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: t })
      if (!error) return NextResponse.redirect(`${origin}${next}`)
      console.error(`[auth/callback] verifyOtp fallback type=${t} error:`, error.message)
    }
  }

  console.error('[auth/callback] Alle auth pogingen mislukt', { code: !!code, token_hash: !!token_hash, type })
  return NextResponse.redirect(`${origin}/login?error=invite_failed`)
}
