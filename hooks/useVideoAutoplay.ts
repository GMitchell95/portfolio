import { RefObject, useEffect } from 'react'

export default function useVideoAutoplay(
  ref: RefObject<HTMLVideoElement>,
  threshold = 0.2
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play()
        } else {
          el.pause()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold])
}
