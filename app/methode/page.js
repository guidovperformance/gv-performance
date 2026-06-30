import MethodeClient from './MethodeClient'

export const metadata = {
  title: 'De Methode — Periodisering, Data & Mentaal',
  description: "Het GV Performance Systeem: training opgebouwd op periodisering, datagedreven voortgang en mentale weerbaarheid. Geen generieke schema's.",
  alternates: { canonical: '/methode' },
  openGraph: {
    title: 'De Methode — GV Performance',
    description: "Het GV Performance Systeem: periodisering, data en mentale weerbaarheid. Geen generieke schema's.",
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <MethodeClient />
}
