'use client'
import { useRouter } from 'next/navigation'

export default function DeleteTestButton({ testId, clientId }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Test verwijderen? Dit kan niet ongedaan worden gemaakt.')) return
    const res = await fetch('/api/dashboard/delete-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId }),
    })
    const data = res.ok ? await res.json() : { error: 'HTTP ' + res.status }
    if (data.error) { alert('Verwijderen mislukt: ' + data.error); return }
    router.push(`/dashboard/coach/clients/${clientId}/test`)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} style={{
      background: 'rgba(248,113,113,0.1)',
      border: '1px solid rgba(248,113,113,0.3)',
      color: '#f87171',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: 11,
      letterSpacing: '2px', textTransform: 'uppercase',
      padding: '8px 14px', cursor: 'pointer',
    }}>
      🗑 Verwijder test
    </button>
  )
}
