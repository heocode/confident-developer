import { Outlet } from 'react-router-dom'

import { SiteNavigation } from './SiteNavigation'

export function AppLayout() {
  return (
    <div className="site-shell">
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
