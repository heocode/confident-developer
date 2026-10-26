import { createContext, useContext } from 'react'

import type {
  PrimaryRouteId,
  RouteMotionPreset,
  RouteTransitionDirection,
} from './primary-routes.ts'

export type RouteTransitionPhase = 'entering' | 'idle' | 'leaving' | 'switching'
export type RouteNavigationRequestResult = 'bypass' | 'busy' | 'started'

export interface RouteTransitionSnapshot {
  direction: RouteTransitionDirection | null
  id: number
  phase: RouteTransitionPhase
  source: PrimaryRouteId | null
  target: PrimaryRouteId | null
}

export interface RouteTransitionContextValue {
  beginNavigation: (to: string) => RouteNavigationRequestResult
  completeEntrance: (transitionId: number) => void
  completeExit: (transitionId: number) => void
  entranceMotionPreset: RouteMotionPreset
  exitMotionPreset: RouteMotionPreset
  snapshot: RouteTransitionSnapshot
}

export const idleRouteTransitionSnapshot: RouteTransitionSnapshot = {
  direction: null,
  id: 0,
  phase: 'idle',
  source: null,
  target: null,
}

export const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null)

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext)

  if (!context) {
    throw new Error('useRouteTransition must be used within AppLayout.')
  }

  return context
}
