'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function WaitingPage() {
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    // Probeer elke 2 seconden opnieuw of het profiel er al is (max 5x)
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); clearInterval(interval); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role) {
        clearInterval(interval)
        router.push(profile.role === 'coach' ? '/dashboard/coach' : '/dashboard/client')
      }
      if (attempts >= 5) {
        clearInterval(interval)
        // Fallback: uitloggen en opnieuw inloggen
        await supabase.auth.signOut()
        router.push('/login?error=profile_missing')
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <svg width="40" height="38" viewBox="0 0 36 34">
        <polygon points="18,2 13,28 23,28" fill="#FF4D00" />
        <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5" />
        <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5" />
      </svg>
      <div style={{ ...D, fontSize: 22, letterSpacing: 3, color: 'var(--orange)' }}>ACCOUNT LADEN...</div>
      <div style={{ ...B, fontSize: 14, color: 'var(--muted)', textAlign: 'center', maxWidth: 300 }}>
        Je account wordt klaargemaakt. Even geduld...
      </div>
    </div>
  )
}
