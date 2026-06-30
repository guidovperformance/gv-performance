'use client'
import * as React from 'react'
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion'

/**
 * Achtergrond-laag van de SmoothScrollHero: clipt en schaalt de video op basis van scroll-positie.
 */
function SmoothScrollHeroBackground({
  scrollHeight,
  desktopVideo,
  mobileVideo,
  initialClipPercentage,
  finalClipPercentage,
}) {
  const { scrollY } = useScroll()

  const clipStart = useTransform(scrollY, [0, scrollHeight], [initialClipPercentage, 0])
  const clipEnd = useTransform(scrollY, [0, scrollHeight], [finalClipPercentage, 100])

  const clipPath = useMotionTemplate`polygon(${clipStart}% ${clipStart}%, ${clipEnd}% ${clipStart}%, ${clipEnd}% ${clipEnd}%, ${clipStart}% ${clipEnd}%)`

  const scale = useTransform(scrollY, [0, scrollHeight + 500], [1.7, 1])

  return (
    <motion.div
      className="sticky top-0 h-screen w-full overflow-hidden bg-black"
      style={{ clipPath, willChange: 'transform, opacity' }}
    >
      {/* Mobiel: verticale video */}
      <motion.video
        className="absolute inset-0 h-full w-full object-cover md:hidden"
        style={{ scale }}
        src={mobileVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Desktop: horizontale video */}
      <motion.video
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
        style={{ scale }}
        src={desktopVideo}
        autoPlay
        loop
        muted
        playsInline
      />
    </motion.div>
  )
}

/**
 * Scroll-gedreven hero met een video-achtergrond die "open clipt" tijdens het scrollen.
 *
 * Props:
 * - scrollHeight (number)            hoogte van het scrollgebied in px (default 1500)
 * - desktopVideo (string)            pad naar de desktop-video (default GV-Performance-Reveal-loop.mp4)
 * - mobileVideo (string)             pad naar de mobiele/verticale video (default GV-Performance-Reveal-vertical-loop.mp4)
 * - initialClipPercentage (number)   start-clip-percentage (default 25)
 * - finalClipPercentage (number)     eind-clip-percentage (default 75)
 */
export default function SmoothScrollHero({
  scrollHeight = 1500,
  desktopVideo = '/GV-Performance-Reveal-loop.mp4',
  mobileVideo = '/GV-Performance-Reveal-vertical-loop.mp4',
  initialClipPercentage = 25,
  finalClipPercentage = 75,
}) {
  return (
    <div style={{ height: `calc(${scrollHeight}px + 100vh)` }} className="relative w-full">
      <SmoothScrollHeroBackground
        scrollHeight={scrollHeight}
        desktopVideo={desktopVideo}
        mobileVideo={mobileVideo}
        initialClipPercentage={initialClipPercentage}
        finalClipPercentage={finalClipPercentage}
      />
    </div>
  )
}
