'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function AuthConfirm() {
  const [status, setStatus] = React.useState('verifying')
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const handleAuth = async () => {
      // Lees hash tokens uit URL
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (!error) {
          if (type === 'invite' || type === 'recovery') {
            router.push('/auth/set-password')
          } else {
            router.push('/dashboard')
          }
        } else {
          setStatus('error')
        }
      } else {
        setStatus('error')
      }
    }
    handleAuth()
  }, [])

  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        {status === 'verifying' ? (
          <>
            <div style={{ ...D, fontSize: 24, letterSpacing: 2, color: 'var(--orange)', marginBottom: 16 }}>VERIFICEREN...</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)' }}>Even geduld, je wordt doorgestuurd.</div>
          </>
        ) : (
          <>
            <div style={{ ...D, fontSize: 24, letterSpacing: 2, color: '#ff6b6b', marginBottom: 16 }}>LINK VERLOPEN</div>
            <div style={{ ...B, fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>De uitnodigingslink is verlopen. Vraag een nieuwe aan bij je coach.</div>
            <a href="/login" style={{ ...B, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--orange)', textDecoration: 'none', borderBottom: '1px solid var(--orange)', paddingBottom: 2 }}>Terug naar login</a>
          </>
        )}
      </div>
    </div>
  )
}
