'use client'
import * as React from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

/**
 * Vervangt een statische hero-foto door een video, exact op de plek en grootte
 * van die foto. De video speelt NIET vanzelf af — de afspeelpositie wordt
 * direct gekoppeld aan de scrollpositie: naar beneden scrollen speelt de video
 * vooruit, naar boven scrollen speelt 'm terug, niet scrollen = stilstaand beeld.
 *
 * `scrollTargetRef` (optioneel): de buitenste "pin-wrapper" met extra scrollhoogte
 * waarbinnen de hero sticky gezet wordt. De scrub-voortgang loopt over de hele
 * hoogte van die wrapper, zodat er genoeg scrollruimte is om het effect echt te
 * zien terwijl de hero vastzit — zonder die ref valt de component terug op zijn
 * eigen (kortere) hoogte.
 */
export default function HeroVideoReveal({ desktopSrc, mobileSrc, alt, scrollTargetRef }) {
  const localRef = React.useRef(null)
  const targetRef = scrollTargetRef || localRef
  const desktopVideoRef = React.useRef(null)
  const mobileVideoRef = React.useRef(null)

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const p = Math.min(Math.max(progress, 0), 1)
    ;[desktopVideoRef.current, mobileVideoRef.current].forEach((v) => {
      if (v && v.duration) v.currentTime = p * v.duration
    })
  })

  return (
    <div ref={scrollTargetRef ? undefined : localRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <video
        ref={desktopVideoRef}
        className="hero-bg-video hero-bg-video-desktop"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        src={desktopSrc}
        muted
        playsInline
        preload="auto"
        aria-label={alt}
      />
      <video
        ref={mobileVideoRef}
        className="hero-bg-video hero-bg-video-mobile"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        src={mobileSrc}
        muted
        playsInline
        preload="auto"
        aria-label={alt}
      />
    </div>
  )
}
