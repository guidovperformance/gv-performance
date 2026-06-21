import { Oswald, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const barlow = Barlow_Condensed({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata = {
  title: 'GV Performance — Guido Vols',
  description: 'Coaching, training en tactical athlete voorbereiding. Jouw doel, ons plan.',
  keywords: 'personal trainer, coaching, tactical athlete, Den Haag, fitness',
  authors: [{ name: 'Guido Vols' }],
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
