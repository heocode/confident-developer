import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(query.matches)

    query.addEventListener('change', updatePreference)

    return () => query.removeEventListener('change', updatePreference)
  }, [])

  return prefersReducedMotion
}

export function useDocumentVisibility() {
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => document.visibilityState !== 'hidden',
  )

  useEffect(() => {
    const updateVisibility = () =>
      setIsDocumentVisible(document.visibilityState !== 'hidden')

    document.addEventListener('visibilitychange', updateVisibility)

    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  return isDocumentVisible
}

export function useServiceRailVisibility(
  targetRef: RefObject<HTMLElement | null>,
  railRef: RefObject<HTMLElement | null>,
) {
  const [isVisible, setIsVisible] = useState(
    () => !('IntersectionObserver' in window),
  )

  useEffect(() => {
    const target = targetRef.current
    const rail = railRef.current

    if (!target || !rail || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) =>
        setIsVisible(
          Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35),
        ),
      { root: rail, threshold: [0, 0.35] },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [railRef, targetRef])

  return isVisible
}
