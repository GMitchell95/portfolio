'use client'

import { useEffect, useRef } from 'react'

type VideoTileProps = {
  /** Base path without extension, e.g. /videos/home/overview-reel */
  src: string
  caption: string
  label: string
}

export default function VideoTile({ src, caption, label }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let inView = false

    const sync = () => {
      if (inView && !motionQuery.matches) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        sync()
      },
      { threshold: 0.25 }
    )
    observer.observe(video)
    motionQuery.addEventListener('change', sync)

    return () => {
      observer.disconnect()
      motionQuery.removeEventListener('change', sync)
    }
  }, [])

  return (
    <div>
      <video
        ref={videoRef}
        className="block w-full h-auto aspect-[2040/1218] rounded-2xl bg-zinc-100"
        muted
        loop
        playsInline
        preload="metadata"
        poster={`${src}-poster.jpg`}
        aria-label={label}
      >
        <source src={`${src}.mp4`} type="video/mp4" />
        <source src={`${src}.webm`} type="video/webm" />
      </video>
      <div className="sw-caption">
        <span className="sw-title">{caption}</span>
      </div>
    </div>
  )
}
