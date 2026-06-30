'use client'
import * as React from 'react'

/**
 * Vervangt een statische hero-foto door een achtergrondvideo, exact op de plek
 * en grootte van die foto — gewoon in de normale paginaflow (geen sticky/pinning,
 * geen extra scrollhoogte), met losse bronnen voor mobiel en desktop.
 *
 * Responsive zichtbaarheid loopt via plain CSS classNames i.p.v. Tailwind-utilities:
 * dit project gebruikt verder overal handgeschreven CSS-in-JS, en Tailwind's
 * responsive varianten bleken hier niet betrouwbaar te compileren.
 */
export default function HeroVideoReveal({ desktopSrc, mobileSrc, alt }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <video
        className="hero-bg-video hero-bg-video-desktop"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        src={desktopSrc}
        autoPlay
        loop
        muted
        playsInline
        aria-label={alt}
      />
      <video
        className="hero-bg-video hero-bg-video-mobile"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        src={mobileSrc}
        autoPlay
        loop
        muted
        playsInline
        aria-label={alt}
      />
    </div>
  )
}
