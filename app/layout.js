import { Bebas_Neue, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const barlow = Barlow_Condensed({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
})

export const metadata = {
  title: 'GV Performance — Guido Vols',
  description: 'Coaching, training en tactical athlete voorbereiding. Jouw doel, ons plan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={`${bebas.variable} ${barlow.variable}`}>
        {children}
      </body>
    </html>
  )
}
