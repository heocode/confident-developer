export interface RouteTransitionActivation {
  altKey: boolean
  button: number
  ctrlKey: boolean
  defaultPrevented: boolean
  metaKey: boolean
  shiftKey: boolean
}

interface RouteTransitionEnvironment {
  isDesktop: boolean
  prefersReducedMotion: boolean
}

export function shouldHandleRouteTransitionActivation(
  activation: RouteTransitionActivation,
  environment: RouteTransitionEnvironment,
) {
  return (
    environment.isDesktop &&
    !environment.prefersReducedMotion &&
    !activation.defaultPrevented &&
    activation.button === 0 &&
    !activation.altKey &&
    !activation.ctrlKey &&
    !activation.metaKey &&
    !activation.shiftKey
  )
}
