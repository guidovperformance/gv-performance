import { Oswald, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
})

const barlow = Barlow_Condensed({
  weight: ['400', '500', '700'],
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
      <body className={`${oswald.variable} ${barlow.variable}`}>
        {children}
      </body>
    </html>
  )
}
