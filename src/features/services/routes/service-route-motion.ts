import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'

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
