import ExpertiseClient from './ExpertiseClient'

export const metadata = {
  title: 'Expertise & Certificeringen',
  description: 'Tien jaar ervaring als topsporter, Korps Mariniers en coach. Bewezen expertise in periodisering, kracht en tactical performance.',
  alternates: { canonical: '/expertise' },
  openGraph: {
    title: 'Expertise & Certificeringen — GV Performance',
    description: 'Tien jaar ervaring als topsporter, Korps Mariniers en coach. Bewezen expertise in periodisering, kracht en tactical performance.',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <ExpertiseClient />
}
