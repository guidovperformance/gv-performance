import ResultatenClient from './ResultatenClient'

export const metadata = {
  title: 'Resultaten',
  description: 'Echte trajecten, echte cijfers. Ontdek hoe sporters en tactical athletes met GV Performance hun doelen haalden.',
  alternates: { canonical: '/resultaten' },
  openGraph: {
    title: 'Resultaten — GV Performance',
    description: 'Echte trajecten, echte cijfers. Ontdek hoe sporters en tactical athletes met GV Performance hun doelen haalden.',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <ResultatenClient />
}
