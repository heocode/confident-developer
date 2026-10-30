import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Outlet } from 'react-router-dom'

import { RouteSurfaceMotion } from '../../../components/layout/route-transitions/route-surface/RouteSurfaceMotion.tsx'
import { usePrimaryRouteMotion } from '../../../components/layout/route-transitions/usePrimaryRouteMotion.ts'
import { usePageScrollLock } from '../../../components/layout/usePageScrollLock.ts'
import { useShortMobileViewport } from '../../../components/layout/useShortMobileViewport.ts'
import { useProjectsList } from '../hooks/useProjectsPageData.ts'
import type { ProjectDetailCache } from '../hooks/useProjectsPageData.ts'
import { PROJECT_RAIL_LAYOUT_TOKENS } from '../presentation/project-rail-layout.ts'
import type { ProjectsRouteContextValue } from './projects-route-context.ts'
import styles from './ProjectsRoute.module.css'

const { baseHeight, baseWidth, horizontalTrackShare } = PROJECT_RAIL_LAYOUT_TOKENS
const documentScrollStyle = {
  '--project-fallback-panel-height': `min(${baseHeight}px, ${(100 * horizontalTrackShare * baseHeight) / baseWidth}vw)`,
} as CSSProperties

export function ProjectsRoute() {
  const { retry, state } = useProjectsList()
  const [detailCache] = useState<ProjectDetailCache>(() => new Map())
  const routeMotion = usePrimaryRouteMotion('projects')
  const usesDocumentScroll = useShortMobileViewport()
  usePageScrollLock(!usesDocumentScroll, 'projects-route')

  return (
    <section
      className={styles.page}
      aria-labelledby="projects-title"
      data-route-motion-direction={routeMotion.direction ?? undefined}
      data-route-motion-phase={routeMotion.phase}
      data-projects-document-scroll={usesDocumentScroll ? '' : undefined}
      style={usesDocumentScroll ? documentScrollStyle : undefined}
    >
      <h1 className={styles.title} id="projects-title">
        THE STUFF ARCHIVE
      </h1>
      <div className={styles.content}>
        <RouteSurfaceMotion motion={routeMotion}>
          <Outlet
            context={{
              detailCache,
              projectsState: state,
              retryProjects: retry,
            } satisfies ProjectsRouteContextValue}
          />
        </RouteSurfaceMotion>
      </div>
    </section>
  )
}
