'use client'

import React from 'react'

const D = { fontFamily: 'var(--font-oswald), Impact, sans-serif' }
const B = { fontFamily: 'var(--font-barlow), sans-serif' }

export default function FeedbackPanel({ clientId, checkIns }) {
  const [message, setMessage] = React.useState('')
  const [linkedCheckin, setLinkedCheckin] = React.useState('')
  const [feedbackList, setFeedbackList] = React.useState([])
  const [status, setStatus] = React.useState('idle')
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (clientId) loadFeedback()
  }, [clientId])

  const loadFeedback = async () => {
    const res = await fetch(`/api/dashboard/feedback?client_id=${clientId}`)
    const data = await res.json()
    if (data.feedback) setFeedbackList(data.feedback)
    setLoaded(true)
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setStatus('loading')
    const res = await fetch('/api/dashboard/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        reference_id: linkedCheckin || null,
        feedback_type: linkedCheckin ? 'checkin' : 'algemeen',
        message: message.trim(),
      }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage('')
      setLinkedCheckin('')
      setStatus('idle')
      loadFeedback()
    } else {
      setStatus('error')
    }
  }

  const inp = { background: 'var(--dark3)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text)', fontFamily: 'var(--font-barlow), sans-serif', fontSize: 14, padding: '12px 14px', outline: 'none', width: '100%' }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ ...B, fontSize: 10, letterSpacing: 4, color: 'var(--orange)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'block', width: 20, height: 2, background: 'var(--orange)' }} />Coach feedback sturen
      </div>

      {/* Feedback form */}
      <div style={{ background: 'var(--dark2)', padding: 24, marginBottom: 2 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Bericht aan klant</label>
            <textarea
              placeholder="Schrijf je feedback, aanmoediging of instructie..."
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ ...inp, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Link to check-in optionally */}
        {checkIns && checkIns.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ ...B, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Koppelen aan check-in (optioneel)</label>
            <select value={linkedCheckin} onChange={e => setLinkedCheckin(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">— Algemene feedback —</option>
              {checkIns.map(c => (
                <option key={c.id} value={c.id}>
                  {new Date(c.checkin_date).toLocaleDateString('nl-NL')} — Energie: {c.energy_level}/5, Gevoel: {c.mood}/5
                </option>
              ))}
            </select>
          </div>
        )}

        {status === 'error' && (
          <div style={{ ...B, fontSize: 13, color: '#ff6b6b', marginBottom: 12 }}>Er ging iets mis. Probeer opnieuw.</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !message.trim()}
          style={{ background: !message.trim() ? 'var(--muted2)' : 'var(--orange)', color: '#000', ...B, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 24px', border: 'none', cursor: message.trim() ? 'pointer' : 'not-allowed' }}
        >
          {status === 'loading' ? 'VERSTUREN...' : '📨 FEEDBACK STUREN'}
        </button>
      </div>

      {/* Previous feedback */}
      {loaded && feedbackList.length > 0 && (
        <div>
          <div style={{ ...B, fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', margin: '16px 0 10px' }}>Eerder verstuurd</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {feedbackList.map(f => (
              <div key={f.id} style={{ background: 'var(--dark2)', padding: '14px 20px', borderLeft: '3px solid rgba(255,77,0,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ ...B, fontSize: 11, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 1 }}>{f.feedback_type}</div>
                  <div style={{ ...B, fontSize: 11, color: 'var(--muted)' }}>{new Date(f.created_at).toLocaleDateString('nl-NL')}</div>
                </div>
                <div style={{ ...B, fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{f.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loaded && feedbackList.length === 0 && (
        <div style={{ background: 'var(--dark2)', padding: 20, textAlign: 'center', ...B, fontSize: 13, color: 'var(--muted)' }}>
          Nog geen feedback verstuurd naar deze klant
        </div>
      )}
    </div>
  )
}
