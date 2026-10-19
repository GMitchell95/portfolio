'use client'

import { useEffect, useRef } from 'react'

export default function NotificationsReelTile() {
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
      <div className="flex items-center" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-muted)', letterSpacing: '0.02em' }}>
          Notifications
        </span>
      </div>
      <video
        ref={videoRef}
        className="block w-full h-auto aspect-[2040/1218] rounded-2xl bg-zinc-100"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/home/notifications-reel-poster.jpg"
        aria-label="Notifications tray: a badge counts up, the tray opens, and one notification is marked as read"
      >
        <source src="/videos/home/notifications-reel.mp4" type="video/mp4" />
        <source src="/videos/home/notifications-reel.webm" type="video/webm" />
      </video>
    </div>
  )
}
