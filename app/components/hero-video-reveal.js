'use client'
import * as React from 'react'
import Image from 'next/image'

/**
 * Speelt een video één keer automatisch af (geen loop, geen scroll-koppeling)
 * op de plek en grootte van de hero-foto. Zodra de video is afgelopen, wisselt
 * de component naar een statische foto die daar blijft staan — gewoon normaal
 * scrollgedrag, geen pinning/sticky.
 */
export default function HeroVideoReveal({ desktopSrc, mobileSrc, fallbackImage, alt }) {
  const [ended, setEnded] = React.useState(false)

  if (ended) {
    return (
      <Image
        src={fallbackImage}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="hero-fallback-photo"
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <video
        className="hero-bg-video hero-bg-video-desktop"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        src={desktopSrc}
        autoPlay
        muted
        playsInline
        onEnded={() => setEnded(true)}
        aria-label={alt}
      />
      <video
        className="hero-bg-video hero-bg-video-mobile"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        src={mobileSrc}
        autoPlay
        muted
        playsInline
        onEnded={() => setEnded(true)}
        aria-label={alt}
      />
    </div>
  )
}
