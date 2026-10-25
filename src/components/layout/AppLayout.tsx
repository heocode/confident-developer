import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { CloudBackground } from './CloudBackground'
import { SiteNavigation } from './SiteNavigation'

const viewportLockedRoutes = new Set(['projects', 'services'])

export function AppLayout() {
  const { pathname } = useLocation()
  const routeSection = pathname.split('/')[1]
  const isViewportLocked = viewportLockedRoutes.has(routeSection)

  useLayoutEffect(() => {
    const root = document.documentElement

    if (isViewportLocked) root.dataset.viewportScroll = 'locked'
    else delete root.dataset.viewportScroll

    return () => {
      delete root.dataset.viewportScroll
    }
  }, [isViewportLocked])

  return (
    <div className="site-shell">
      <CloudBackground />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <SiteNavigation />
      </header>
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
