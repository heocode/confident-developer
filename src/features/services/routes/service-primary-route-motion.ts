import type { PrimaryRouteMotionPhase } from '../../../components/layout/route-transitions/usePrimaryRouteMotion.ts'

const MAX_STAGGER_MS = 120
const PREFERRED_STAGGER_STEP_MS = 44

export interface ServiceRouteItemMotion {
  delayMs: number
  isTerminal: boolean
}

export function getServiceRouteItemMotion(
  index: number,
  itemCount: number,
  phase: PrimaryRouteMotionPhase,
): ServiceRouteItemMotion {
  if (phase === 'idle' || itemCount <= 0) {
    return { delayMs: 0, isTerminal: false }
  }

  const lastIndex = itemCount - 1
  const order = phase === 'entering' ? index : lastIndex - index
  const staggerStep =
    lastIndex === 0
      ? 0
      : Math.min(PREFERRED_STAGGER_STEP_MS, MAX_STAGGER_MS / lastIndex)

  return {
    delayMs: Math.round(Math.max(0, order) * staggerStep),
    isTerminal: order === lastIndex,
  }
}
