import TestimonialsClient from './TestimonialsClient'

export const metadata = {
  title: 'Wat Cliënten Zeggen',
  description: 'Lees ervaringen van sporters en tactical athletes die met GV Performance hun doelen hebben bereikt.',
  alternates: { canonical: '/testimonials' },
  openGraph: {
    title: 'Wat Cliënten Zeggen — GV Performance',
    description: 'Lees ervaringen van sporters en tactical athletes die met GV Performance hun doelen hebben bereikt.',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <TestimonialsClient />
}
