import GratisKrachttestClient from './GratisKrachttestClient'

export const metadata = {
  title: 'Gratis Pre-Selectie Krachttest',
  description: 'Download gratis de Pre-Selectie Krachttest + Normen (PDF) en ontdek waar je fysiek staat ten opzichte van de selectie-eisen.',
  alternates: { canonical: '/gratis-krachttest' },
  openGraph: {
    title: 'Gratis Pre-Selectie Krachttest — GV Performance',
    description: 'Download gratis de Pre-Selectie Krachttest + Normen (PDF).',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <GratisKrachttestClient />
}
