'use client'

import { useEffect, useRef, useState } from 'react'

type VideoTileProps = {
  /** Base path without extension, e.g. /videos/home/overview-reel */
  src: string
  /** Not shown on screen; used for the pause/play button labels */
  name: string
  label: string
}

const PAUSE_BUTTON_CLASS = [
  'absolute right-4 bottom-4 flex items-center justify-center',
  'w-8 h-8 max-[699px]:w-10 max-[699px]:h-10 rounded-full',
  'bg-[rgba(255,255,255,0.35)] hover:bg-[rgba(255,255,255,0.6)] backdrop-blur-[8px]',
  'shadow-[0_0_0_1px_rgba(24,24,27,0.03),0_1px_2px_rgba(24,24,27,0.03)]',
  'text-[color:var(--color-body)] hover:text-[color:var(--color-heading)]',
  '[transition:background-color_150ms_ease-out,color_150ms_ease-out,transform_100ms_ease-out]',
  'active:scale-[0.97]',
  'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(68,67,180,0.35)]',
].join(' ')

function VideoPauseButton({ paused, name, onToggle }: { paused: boolean; name: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={PAUSE_BUTTON_CLASS}
      aria-pressed={paused}
      aria-label={`${paused ? 'Play' : 'Pause'} ${name}`}
      onClick={onToggle}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        {paused ? (
          <path d="M3.2 1.7v8.6a.6.6 0 0 0 .92.5l6.6-4.3a.6.6 0 0 0 0-1L4.12 1.2a.6.6 0 0 0-.92.5z" />
        ) : (
          <>
            <rect x="2" y="1.5" width="2.75" height="9" rx="1" />
            <rect x="7.25" y="1.5" width="2.75" height="9" rx="1" />
          </>
        )}
      </svg>
    </button>
  )
}

export default function VideoTile({ src, name, label }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const inViewRef = useRef(false)
  // The viewer's choice wins: a paused video stays paused through scrolling
  const [userPaused, setUserPaused] = useState(false)
  const userPausedRef = useRef(userPaused)
  userPausedRef.current = userPaused

  const sync = () => {
    const video = videoRef.current
    if (!video) return
    if (inViewRef.current && !userPausedRef.current) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  const setPaused = (paused: boolean) => {
    userPausedRef.current = paused
    setUserPaused(paused)
    sync()
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Reduced motion starts paused on the poster; the viewer can still press Play
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) setPaused(true)
    const onMotionChange = () => {
      if (motionQuery.matches) setPaused(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting
        sync()
      },
      { threshold: 0.25 }
    )
    observer.observe(video)
    motionQuery.addEventListener('change', onMotionChange)

    return () => {
      observer.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative">
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
      <VideoPauseButton paused={userPaused} name={name} onToggle={() => setPaused(!userPaused)} />
    </div>
  )
}
