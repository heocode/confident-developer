import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AnimationEvent, RefObject } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  findPrimaryRoute,
  getRouteTransitionDirection,
  primaryRoutes,
} from './primary-routes.ts'
import type { RouteMotionPreset } from './primary-routes.ts'
import { idleRouteTransitionSnapshot } from './route-transition-context.ts'
import type {
  RouteTransitionContextValue,
  RouteTransitionSnapshot,
} from './route-transition-context.ts'
import { routeTransitionTiming } from './route-transition-timing.ts'

interface ActiveRouteTransition extends RouteTransitionSnapshot {
  direction: NonNullable<RouteTransitionSnapshot['direction']>
  source: NonNullable<RouteTransitionSnapshot['source']>
  target: NonNullable<RouteTransitionSnapshot['target']>
  to: string
}

type InternalRouteTransition = ActiveRouteTransition | RouteTransitionSnapshot

function isDesktopMotionEnabled() {
  return (
    window.matchMedia('(min-width: 48.001rem)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function getMotionPreset(
  routeId: RouteTransitionSnapshot['source'],
): RouteMotionPreset {
  return primaryRoutes.find(({ id }) => id === routeId)?.motionPreset ?? 'fallback'
}

export function useRouteTransitionCoordinator(
  mainRef: RefObject<HTMLElement | null>,
) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const transitionRef = useRef<InternalRouteTransition>(
    idleRouteTransitionSnapshot,
  )
  const [transition, setTransition] = useState<InternalRouteTransition>(
    idleRouteTransitionSnapshot,
  )

  const updateTransition = useCallback((next: InternalRouteTransition) => {
    transitionRef.current = next
    setTransition(next)
  }, [])

  const completeEntrance = useCallback(
    (transitionId: number) => {
      const current = transitionRef.current
      if (current.id !== transitionId || current.phase !== 'entering') return

      updateTransition({
        ...idleRouteTransitionSnapshot,
        id: current.id,
      })

      if (current.target !== 'contact') {
        mainRef.current?.focus({ preventScroll: true })
      }
    },
    [mainRef, updateTransition],
  )

  const completeExit = useCallback(
    (transitionId: number) => {
      const current = transitionRef.current
      if (current.id !== transitionId || current.phase !== 'leaving' || !('to' in current)) {
        return
      }

      const switchingTransition: ActiveRouteTransition = {
        ...current,
        phase: 'switching',
      }
      updateTransition(switchingTransition)
      void navigate(current.to)
    },
    [navigate, updateTransition],
  )

  const beginNavigation = useCallback(
    (to: string) => {
      if (transitionRef.current.phase !== 'idle') return 'busy' as const
      if (!isDesktopMotionEnabled()) return 'bypass' as const

      const source = findPrimaryRoute(pathname)
      const targetPathname = new URL(to, window.location.href).pathname
      const target = findPrimaryRoute(targetPathname)
      const direction = getRouteTransitionDirection(source, target)

      if (!source || !target || !direction) return 'bypass' as const

      updateTransition({
        direction,
        id: transitionRef.current.id + 1,
        phase: 'leaving',
        source: source.id,
        target: target.id,
        to,
      })

      return 'started' as const
    },
    [pathname, updateTransition],
  )

  useLayoutEffect(() => {
    const current = transitionRef.current
    if (current.phase !== 'switching' || !('to' in current)) return

    const currentRoute = findPrimaryRoute(pathname)
    if (currentRoute?.id !== current.target) return

    const root = document.documentElement
    const previousScrollBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo({ left: 0, top: 0 })
    root.style.scrollBehavior = previousScrollBehavior

    if (!isDesktopMotionEnabled()) {
      updateTransition({
        ...idleRouteTransitionSnapshot,
        id: current.id,
      })
      return
    }

    updateTransition({
      ...current,
      phase: 'entering',
    })
  }, [pathname, updateTransition])

  useEffect(() => {
    if (transition.phase === 'idle' || transition.phase === 'switching') return

    const transitionId = transition.id
    const timeout = window.setTimeout(() => {
      if (transition.phase === 'leaving') completeExit(transitionId)
      else completeEntrance(transitionId)
    }, (transition.phase === 'leaving'
      ? routeTransitionTiming.exitDurationMs
      : routeTransitionTiming.entranceDurationMs) + routeTransitionTiming.safetyBufferMs)

    return () => window.clearTimeout(timeout)
  }, [completeEntrance, completeExit, transition.id, transition.phase])

  useEffect(() => {
    if (transition.phase === 'idle') return

    const desktopQuery = window.matchMedia('(min-width: 48.001rem)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const finishIfMotionIsUnavailable = () => {
      if (desktopQuery.matches && !reducedMotionQuery.matches) return

      const current = transitionRef.current
      if (current.phase === 'leaving') completeExit(current.id)
      if (current.phase === 'entering') completeEntrance(current.id)
    }

    desktopQuery.addEventListener('change', finishIfMotionIsUnavailable)
    reducedMotionQuery.addEventListener('change', finishIfMotionIsUnavailable)
    finishIfMotionIsUnavailable()

    return () => {
      desktopQuery.removeEventListener('change', finishIfMotionIsUnavailable)
      reducedMotionQuery.removeEventListener('change', finishIfMotionIsUnavailable)
    }
  }, [completeEntrance, completeExit, transition.phase])

  useEffect(() => {
    if (transition.phase === 'idle') return

    const preventScroll = (event: WheelEvent) => event.preventDefault()
    window.addEventListener('wheel', preventScroll, { passive: false })

    return () => window.removeEventListener('wheel', preventScroll)
  }, [transition.phase])

  const exitMotionPreset = getMotionPreset(transition.source)
  const entranceMotionPreset = getMotionPreset(transition.target)
  const contextValue = useMemo<RouteTransitionContextValue>(
    () => ({
      beginNavigation,
      completeEntrance,
      completeExit,
      entranceMotionPreset,
      exitMotionPreset,
      snapshot: transition,
    }),
    [
      beginNavigation,
      completeEntrance,
      completeExit,
      entranceMotionPreset,
      exitMotionPreset,
      transition,
    ],
  )
  const activeMotionPreset =
    transition.phase === 'leaving' ? exitMotionPreset : entranceMotionPreset
  const isTransitioning = transition.phase !== 'idle'

  const handleRouteAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (event.currentTarget !== event.target) return

    if (transition.phase === 'leaving') completeExit(transition.id)
    if (transition.phase === 'entering') completeEntrance(transition.id)
  }

  return {
    activeMotionPreset,
    contextValue,
    handleRouteAnimationEnd,
    isTransitioning,
    transition,
  }
}
