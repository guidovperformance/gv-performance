'use client'
import * as React from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

/**
 * Vervangt een statische hero-foto door een video, exact op de plek en grootte
 * van die foto. De video speelt NIET vanzelf af — de afspeelpositie wordt
 * direct gekoppeld aan de scrollpositie: naar beneden scrollen speelt de video
 * vooruit, naar boven scrollen speelt 'm terug, niet scrollen = stilstaand beeld.
 * De video is "klaar" (einde bereikt) zodra de onderkant van deze sectie de
 * bovenkant van het scherm bereikt.
 */
export default function HeroVideoReveal({ desktopSrc, mobileSrc, alt }) {
  const containerRef = React.useRef(null)
  const desktopVideoRef = React.useRef(null)
  const mobileVideoRef = React.useRef(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const p = Math.min(Math.max(progress, 0), 1)
    ;[desktopVideoRef.current, mobileVideoRef.current].forEach((v) => {
      if (v && v.duration) v.currentTime = p * v.duration
    })
  })

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
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
