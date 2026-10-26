import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'

interface ServiceTransitionActivation {
  altKey: boolean
  button: number
  ctrlKey: boolean
  detail: number
  metaKey: boolean
  shiftKey: boolean
}

type ServiceMediaQueryMatcher = (query: string) => boolean

export interface ServiceTransitionRect {
  height: number
  left: number
  top: number
  width: number
}

export interface ServiceOpeningRequest {
  actionRect: ServiceTransitionRect
  service: ServiceSummaryPresentation
  surfaceRect: ServiceTransitionRect
}

export interface ServiceOpeningGeometry {
  actionRect: ServiceTransitionRect
  surfaceRect: ServiceTransitionRect
}

export type ServiceOpeningPhase = 'handoff' | 'opening' | 'preparing' | 'settled'

export interface ServiceOpeningState {
  detailResolved: boolean
  geometry: ServiceOpeningGeometry
  phase: ServiceOpeningPhase
  service: ServiceSummaryPresentation
}

export type ServiceClosingPhase = 'collapsing' | 'content-exit' | 'measuring'

export interface ServiceClosingState {
  geometry: ServiceOpeningGeometry | null
  phase: ServiceClosingPhase
  service: ServiceSummaryPresentation
}

export function shouldAnimateServiceTransition(
  event: ServiceTransitionActivation,
  matchesMedia: ServiceMediaQueryMatcher = (query) =>
    window.matchMedia(query).matches,
) {
  if (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return false
  }

  const usesMobileLayout = matchesMedia('(max-width: 48rem)')
  const usesFinePointer = matchesMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 48.0625rem)',
  )
  const usesKeyboard = event.detail === 0
  const usesDesktopLayout = matchesMedia('(min-width: 48.0625rem)')

  return usesMobileLayout || usesFinePointer || (usesKeyboard && usesDesktopLayout)
}

function makeRelativeRect(
  rect: ServiceTransitionRect,
  containerRect: ServiceTransitionRect,
): ServiceTransitionRect {
  return {
    height: rect.height,
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
  }
}

export function createServiceOpeningGeometry(
  request: ServiceOpeningRequest,
  contentRect: ServiceTransitionRect,
): ServiceOpeningGeometry {
  return {
    actionRect: makeRelativeRect(request.actionRect, contentRect),
    surfaceRect: makeRelativeRect(request.surfaceRect, contentRect),
  }
}

export function toServiceTransitionRect(rect: DOMRect): ServiceTransitionRect {
  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  }
}
