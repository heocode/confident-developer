import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { CloudBackground } from './CloudBackground'
import { RouteTransitionContext } from './route-transitions/route-transition-context.ts'
import { useRouteTransitionCoordinator } from './route-transitions/useRouteTransitionCoordinator.ts'
import { SiteNavigation } from './SiteNavigation'

const viewportLockedRoutes = new Set(['projects', 'services'])

export function AppLayout() {
  const { pathname } = useLocation()
  const routeSection = pathname.split('/')[1]
  const isViewportLocked = viewportLockedRoutes.has(routeSection)
  const mainRef = useRef<HTMLElement>(null)
  const {
    activeMotionPreset,
    contextValue,
    handleRouteAnimationEnd,
    isTransitioning,
    transition,
  } = useRouteTransitionCoordinator(mainRef)

  useLayoutEffect(() => {
    const root = document.documentElement

    if (isViewportLocked) root.dataset.viewportScroll = 'locked'
    else delete root.dataset.viewportScroll

    return () => {
      delete root.dataset.viewportScroll
    }
  }, [isViewportLocked])

  return (
    <RouteTransitionContext.Provider value={contextValue}>
      <div
        className="site-shell"
        data-route-transition-active={isTransitioning ? '' : undefined}
        data-route-transition-direction={transition.direction ?? undefined}
        data-route-transition-phase={transition.phase}
        data-route-transition-source={transition.source ?? undefined}
        data-route-transition-target={transition.target ?? undefined}
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
      </div>
    </RouteTransitionContext.Provider>
  )
}
