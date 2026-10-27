import { useCallback } from 'react'

import type {
  PrimaryRouteId,
  RouteTransitionDirection,
} from './primary-routes.ts'
import type {
  RouteTransitionPhase,
  RouteTransitionSnapshot,
} from './route-transition-context.ts'
import { useRouteTransition } from './route-transition-context.ts'

export type PrimaryRouteMotionPhase = Extract<
  RouteTransitionPhase,
  'entering' | 'leaving'
> | 'idle'

export interface PrimaryRouteMotionSnapshot {
  direction: RouteTransitionDirection | null
  phase: PrimaryRouteMotionPhase
  transitionId: number
}

export function resolvePrimaryRouteMotion(
  transition: RouteTransitionSnapshot,
  routeId: PrimaryRouteId,
): PrimaryRouteMotionSnapshot {
  const isLeaving =
    transition.phase === 'leaving' && transition.source === routeId
  const isEntering =
    transition.phase === 'entering' && transition.target === routeId

  if (!isLeaving && !isEntering) {
    return {
      direction: null,
      phase: 'idle',
      transitionId: transition.id,
    }
  }

  return {
    direction: transition.direction,
    phase: isLeaving ? 'leaving' : 'entering',
    transitionId: transition.id,
  }
}

export function usePrimaryRouteMotion(routeId: PrimaryRouteId) {
  const { completeEntrance, completeExit, snapshot } = useRouteTransition()
  const motion = resolvePrimaryRouteMotion(snapshot, routeId)

  const complete = useCallback(() => {
    if (motion.phase === 'leaving') completeExit(motion.transitionId)
    if (motion.phase === 'entering') completeEntrance(motion.transitionId)
  }, [completeEntrance, completeExit, motion.phase, motion.transitionId])

  return { ...motion, complete }
}
