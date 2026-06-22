import { Big_Shoulders, Work_Sans } from 'next/font/google'
import './globals.css'

// Variabelen heten nog --font-oswald/--font-barlow (historische naam) maar laden
// nu Big Shoulders (condensed display, koppen) en Work Sans (body/UI) — Variant B.
const oswald = Big_Shoulders({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const barlow = Work_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

const SITE_URL = 'https://www.gvperformance.nl'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GV Performance — Guido Vols',
    template: '%s — GV Performance',
  },
  description: 'Coaching, training en tactical athlete voorbereiding. Jouw doel, ons plan.',
  keywords: 'personal trainer, coaching, tactical athlete, Den Haag, fitness',
  authors: [{ name: 'Guido Vols' }],
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GV Performance',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: SITE_URL,
    siteName: 'GV Performance',
    title: 'GV Performance — Guido Vols',
    description: 'Coaching, training en tactical athlete voorbereiding. Jouw doel, ons plan.',
    images: [{ url: '/hero.jpg', width: 1536, height: 2048, alt: 'GV Performance — Guido Vols' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GV Performance — Guido Vols',
    description: 'Coaching, training en tactical athlete voorbereiding. Jouw doel, ons plan.',
    images: ['/hero.jpg'],
  },
}

// FIXED: viewport als aparte export (Next.js 14+ vereiste)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#D4A857',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={`${oswald.variable} ${barlow.variable}`}>
        {children}
      </body>
    </html>
  )
}
