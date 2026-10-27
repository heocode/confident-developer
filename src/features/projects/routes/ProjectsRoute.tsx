import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { RouteSurfaceMotion } from '../../../components/layout/route-transitions/route-surface/RouteSurfaceMotion.tsx'
import { usePrimaryRouteMotion } from '../../../components/layout/route-transitions/usePrimaryRouteMotion.ts'
import { useProjectsList } from '../hooks/useProjectsPageData.ts'
import type { ProjectDetailCache } from '../hooks/useProjectsPageData.ts'
import type { ProjectsRouteContextValue } from './projects-route-context.ts'
import styles from './ProjectsRoute.module.css'

export function ProjectsRoute() {
  const { retry, state } = useProjectsList()
  const [detailCache] = useState<ProjectDetailCache>(() => new Map())
  const routeMotion = usePrimaryRouteMotion('projects')

  return (
    <section
      className={styles.page}
      aria-labelledby="projects-title"
      data-route-motion-direction={routeMotion.direction ?? undefined}
      data-route-motion-phase={routeMotion.phase}
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
