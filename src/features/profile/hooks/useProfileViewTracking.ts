import { useEffect, useRef } from 'react'

export function useProfileViewTracking(enabled: boolean, recordView: () => void) {
  const cardRef = useRef<HTMLDivElement>(null)
  const hasTrackedViewRef = useRef(false)

  useEffect(() => {
    if (!enabled) {
      hasTrackedViewRef.current = false
      return
    }

    const card = cardRef.current
    if (!card || hasTrackedViewRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.9) return

        hasTrackedViewRef.current = true
        observer.disconnect()
        recordView()
      },
      { threshold: [0.9] },
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [enabled, recordView])

  return cardRef
}
