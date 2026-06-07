import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // FIXED: gebruik request URL origin i.p.v. hardcoded env var
  const origin = new URL(request.url).origin
  return NextResponse.redirect(new URL('/login', origin))
}
