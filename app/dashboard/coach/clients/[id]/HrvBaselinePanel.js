'use client'

import React from 'react'

const B = { fontFamily: 'var(--font-barlow), sans-serif' }

const inp = {
  background: 'var(--dark3)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text)',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: 14,
  padding: '10px 12px',
  outline: 'none',
  width: 100,
  colorScheme: 'dark',
}

export default function HrvBaselinePanel({ clientId, initialBaseline }) {
  const [value, setValue] = React.useState(initialBaseline ?? '')
  const [status, setStatus] = React.useState('idle')

  const handleSave = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/dashboard/hrv-baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, hrv_baseline: value || null }),
      })
      const data = await res.json()
      setStatus(data.success ? 'saved' : 'error')
      if (data.success) setTimeout(() => setStatus('idle'), 2000)
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>HRV-baseline (7d gem., ms)</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" step="0.1" placeholder="—" value={value} onChange={e => setValue(e.target.value)} style={inp} />
        <button
          onClick={handleSave}
          disabled={status === 'loading'}
          style={{ background: 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 16px', border: 'none', cursor: 'pointer' }}
        >
          {status === 'loading' ? '...' : 'Opslaan'}
        </button>
        {status === 'saved' && <span style={{ ...B, fontSize: 12, color: '#4ade80' }}>✓</span>}
        {status === 'error' && <span style={{ ...B, fontSize: 12, color: '#f87171' }}>Fout</span>}
      </div>
    </div>
  )
}
