'use client'
import React from 'react'

export default function CopyButton({ text, label }) {
  const [done, setDone] = React.useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
      .then(() => { setDone(true); setTimeout(() => setDone(false), 2000) })
      .catch(() => { alert('Selecteer de tekst handmatig en kopieer met Ctrl+C') })
  }
  return (
    <button onClick={copy} style={{
      background: done ? '#4ade80' : '#1e1e1e',
      border: `1px solid ${done ? '#4ade80' : '#555'}`,
      color: done ? '#000' : '#f0ede8',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: 11, letterSpacing: '2px',
      textTransform: 'uppercase', padding: '8px 18px', cursor: 'pointer',
      transition: 'all 0.2s',
    }}>
      {done ? '✓ Gekopieerd!' : (label || '📋 Kopieer')}
    </button>
  )
}
