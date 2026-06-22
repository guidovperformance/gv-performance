// app/dashboard/client/components.js
// Gedeelde componenten voor alle client pagina's
'use client'

import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function BottomNav({ active }) {
  const items = [
    { href: '/dashboard/client',         id: 'home',    label: 'Home',
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { href: '/dashboard/client/week',    id: 'week',    label: 'Week',
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { href: '/dashboard/client/checkin', id: 'checkin', label: 'Check-in',
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { href: '/dashboard/client/history', id: 'history', label: 'Voortgang',
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', zIndex: 100,
      background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {items.map(item => {
        const isActive = active === item.id
        return (
          <Link key={item.id} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            minHeight: 56, padding: '8px 8px', color: isActive ? '#D4A857' : '#777', textDecoration: 'none',
            fontFamily: "var(--font-barlow), sans-serif", position: 'relative',
            transition: 'color .2s ease, transform .2s cubic-bezier(0.16,1,0.3,1)',
            transform: isActive ? 'translateY(-1px)' : 'none',
          }}>
            {isActive && (
              <span style={{
                position: 'absolute', top: 2, width: 28, height: 3, borderRadius: 2,
                background: 'linear-gradient(90deg,#E8C77E,#D4A857)',
              }} />
            )}
            {item.svg}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "var(--font-barlow), sans-serif" }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function TopBar({ backHref, backLabel, showLogout, title }) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
  return (
    <header style={{
      background: '#141414',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: 'calc(env(safe-area-inset-top, 0px) + 13px) 20px 13px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {backHref ? (
          <Link href={backHref} aria-label={backLabel || 'Terug'} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, marginLeft: -8, flexShrink: 0, color: '#D4A857', textDecoration: 'none',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
        ) : (
          <svg width="18" height="16" viewBox="0 0 36 34" style={{ flexShrink: 0 }}>
            <polygon points="18,2 13,28 23,28" fill="#D4A857"/>
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5"/>
          </svg>
        )}
        <span style={{ fontFamily: "var(--font-oswald), Impact, sans-serif", fontSize: 14, letterSpacing: '3px', fontWeight: 700, color: '#f0ede8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title ? title.toUpperCase() : 'GV PERFORMANCE'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
        {showLogout && (
          <button onClick={handleSignOut} style={{
            fontFamily: "var(--font-barlow), sans-serif", fontSize: 10, letterSpacing: '1px', color: '#999',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            minHeight: 32, padding: '5px 14px', cursor: 'pointer', textTransform: 'uppercase',
          }}>
            Uitloggen
          </button>
        )}
      </div>
    </header>
  )
}
