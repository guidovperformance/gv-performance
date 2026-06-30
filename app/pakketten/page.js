import PakkettenClient from './PakkettenClient'

export const metadata = {
  title: 'Pakketten & Tarieven',
  description: "Transparante pakketten voor 1-op-1 coaching, tactical athlete voorbereiding en topsport-begeleiding. Vanaf €119/maand — kies het traject dat bij jouw doel past.",
  alternates: { canonical: '/pakketten' },
  openGraph: {
    title: 'Pakketten & Tarieven — GV Performance',
    description: 'Transparante pakketten voor 1-op-1 coaching, tactical athlete voorbereiding en topsport-begeleiding. Vanaf €119/maand.',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
}

export default function Page() {
  return <PakkettenClient />
}
