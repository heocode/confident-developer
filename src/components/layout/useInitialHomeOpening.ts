import { useCallback, useEffect, useState } from 'react'

import {
  INITIAL_HOME_OPENING_DURATION_MS,
  shouldCancelInitialHomeOpeningFromKey,
  shouldStartInitialHomeOpening,
} from './initial-home-opening.ts'

export function useInitialHomeOpening(pathname: string) {
  const [isRunning, setIsRunning] = useState(() =>
    shouldStartInitialHomeOpening({
      pathname,
      prefersReducedMotion: window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches,
      scrollPosition: window.scrollY,
    }),
  )
  const complete = useCallback(() => setIsRunning(false), [])
  const isActive = isRunning && pathname === '/'

  useEffect(() => {
    if (!isActive) return

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const finishTimer = window.setTimeout(
      complete,
      INITIAL_HOME_OPENING_DURATION_MS,
    )
    const completeFromNavigation = (event: globalThis.MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.site-navigation__link')
      ) {
        complete()
      }
    }
    const completeFromKeyboard = (event: globalThis.KeyboardEvent) => {
      if (shouldCancelInitialHomeOpeningFromKey(event.key)) complete()
    }
    const completeFromMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) complete()
    }

    window.addEventListener('scroll', complete, { passive: true })
    window.addEventListener('touchmove', complete, { passive: true })
    window.addEventListener('wheel', complete, { passive: true })
    document.addEventListener('keydown', completeFromKeyboard)
    document.addEventListener('click', completeFromNavigation, true)
    reducedMotionQuery.addEventListener('change', completeFromMotionPreference)

    return () => {
      window.clearTimeout(finishTimer)
      window.removeEventListener('scroll', complete)
      window.removeEventListener('touchmove', complete)
      window.removeEventListener('wheel', complete)
      document.removeEventListener('keydown', completeFromKeyboard)
      document.removeEventListener('click', completeFromNavigation, true)
      reducedMotionQuery.removeEventListener(
        'change',
        completeFromMotionPreference,
      )
    }
  }, [complete, isActive])

  return isActive
}
