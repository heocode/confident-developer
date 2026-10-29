import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { CloudBackground } from './CloudBackground'
import { DocumentScrollIndicator } from './DocumentScrollIndicator.tsx'
import { RouteTransitionContext } from './route-transitions/route-transition-context.ts'
import { routeTransitionTiming } from './route-transitions/route-transition-timing.ts'
import { useRouteTransitionCoordinator } from './route-transitions/useRouteTransitionCoordinator.ts'
import { SiteNavigation } from './SiteNavigation'
import { useInitialHomeOpening } from './useInitialHomeOpening.ts'
import { usePageScrollLock } from './usePageScrollLock.ts'

const viewportLockedRoutes = new Set(['services', 'about', 'references', 'contact'])
type RouteTransitionStyle = CSSProperties & {
  '--route-transition-entrance-duration': string
  '--route-transition-exit-duration': string
}

const routeTransitionStyle: RouteTransitionStyle = {
  '--route-transition-entrance-duration': `${routeTransitionTiming.entranceDurationMs}ms`,
  '--route-transition-exit-duration': `${routeTransitionTiming.exitDurationMs}ms`,
}

export function AppLayout() {
  const { pathname } = useLocation()
  const routeSection = pathname.split('/')[1]
  const isViewportLocked = viewportLockedRoutes.has(routeSection)
  const isInitialHomeOpening = useInitialHomeOpening(pathname)
  const mainRef = useRef<HTMLElement>(null)
  const {
    activeMotionPreset,
    contextValue,
    handleRouteAnimationEnd,
    isTransitioning,
    transition,
  } = useRouteTransitionCoordinator(mainRef)
  usePageScrollLock(isViewportLocked, 'viewport-route')

  return (
    <RouteTransitionContext.Provider value={contextValue}>
      <div
        className="site-shell"
        data-initial-home-opening={isInitialHomeOpening ? 'running' : undefined}
        data-route-transition-active={isTransitioning ? '' : undefined}
        data-route-transition-direction={transition.direction ?? undefined}
        data-route-transition-phase={transition.phase}
        data-route-transition-source={transition.source ?? undefined}
        data-route-transition-target={transition.target ?? undefined}
        style={routeTransitionStyle}
      >
        <CloudBackground />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <SiteNavigation />
        </header>
        <main
          aria-busy={isTransitioning || undefined}
          className="site-main"
          data-route-motion-preset={activeMotionPreset}
          data-route-transition-direction={transition.direction ?? undefined}
          data-route-transition-phase={transition.phase}
          id="main-content"
          onAnimationEnd={handleRouteAnimationEnd}
          ref={mainRef}
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <DocumentScrollIndicator />
      </div>
    </RouteTransitionContext.Provider>
  )
}
