import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'

interface ServiceTransitionActivation {
  altKey: boolean
  button: number
  ctrlKey: boolean
  detail: number
  metaKey: boolean
  shiftKey: boolean
}

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

export function shouldAnimateServiceTransition(event: ServiceTransitionActivation) {
  if (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return false
  }

  const usesFinePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 48.0625rem)',
  ).matches
  const usesKeyboard = event.detail === 0
  const usesDesktopLayout = window.matchMedia('(min-width: 48.0625rem)').matches

  return usesFinePointer || (usesKeyboard && usesDesktopLayout)
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
