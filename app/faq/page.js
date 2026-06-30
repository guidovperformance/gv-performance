import FaqClient from './FaqClient'

export const metadata = {
  title: 'Veelgestelde Vragen',
  description: 'Antwoorden op de meest gestelde vragen over coaching, trajecten, tarieven en de werkwijze van GV Performance.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Veelgestelde Vragen — GV Performance',
    description: 'Antwoorden op de meest gestelde vragen over coaching, trajecten, tarieven en de werkwijze van GV Performance.',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <FaqClient />
}
