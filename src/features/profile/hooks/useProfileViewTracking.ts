import { useEffect, useRef } from 'react'

export function useProfileViewTracking<
  ElementType extends HTMLElement = HTMLDivElement,
>(enabled: boolean, recordView: () => void) {
  const profileRef = useRef<ElementType>(null)
  const hasTrackedViewRef = useRef(false)

  useEffect(() => {
    if (!enabled) {
      hasTrackedViewRef.current = false
      return
    }

    const profile = profileRef.current
    if (!profile || hasTrackedViewRef.current) return

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

    observer.observe(profile)
    return () => observer.disconnect()
  }, [enabled, recordView])

  return profileRef
}
