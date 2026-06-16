// app/dashboard/client/components.js
// Gedeelde componenten voor alle client pagina's
'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'

export function BottomNav({ active }) {
  const items = [
    { href: '/dashboard/client',         id: 'home',    label: 'Home',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { href: '/dashboard/client/week',    id: 'week',    label: 'Week',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { href: '/dashboard/client/checkin', id: 'checkin', label: 'Check-in',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { href: '/dashboard/client/history', id: 'history', label: 'Voortgang',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ]
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'#1a1a1a', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
      {items.map(item => {
        const isActive = active === item.id
        return (
          <a key={item.id} href={item.href} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 8px', color:isActive ? '#FF4D00' : '#666', textDecoration:'none', fontFamily:"'Barlow Condensed', sans-serif" }}>
            {item.svg}
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', fontFamily:"'Barlow Condensed', sans-serif" }}>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

export function TopBar({ backHref, backLabel, showLogout }) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
  return (
    <header style={{ background:'#1a1a1a', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'13px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <svg width="18" height="16" viewBox="0 0 36 34">
          <polygon points="18,2 13,28 23,28" fill="#FF4D00"/>
          <polygon points="5,7 0,28 14,28" fill="#FF4D00" opacity="0.5"/>
          <polygon points="31,7 23,28 36,28" fill="#FF4D00" opacity="0.5"/>
        </svg>
        <span style={{ fontFamily:"'Oswald', Impact, sans-serif", fontSize:14, letterSpacing:'3px', fontWeight:700, color:'#f0ede8' }}>GV PERFORMANCE</span>
      </div>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        {backHref && (
          <a href={backHref} style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, letterSpacing:'1px', color:'#666', textDecoration:'none', textTransform:'uppercase' }}>
            ← {backLabel || 'Terug'}
          </a>
        )}
        {showLogout && (
          <button onClick={handleSignOut} style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, letterSpacing:'1px', color:'#555', background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'5px 12px', cursor:'pointer', textTransform:'uppercase' }}>
            Uitloggen
          </button>
        )}
      </div>
    </header>
  )
}
