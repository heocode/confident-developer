import { useState } from 'react'
import type { AnimationEvent } from 'react'
import { Outlet } from 'react-router-dom'

import { usePrimaryRouteMotion } from '../../../components/layout/route-transitions/usePrimaryRouteMotion.ts'
import { useProjectsList } from '../hooks/useProjectsPageData.ts'
import type { ProjectDetailCache } from '../hooks/useProjectsPageData.ts'
import type { ProjectsRouteContextValue } from './projects-route-context.ts'
import styles from './ProjectsRoute.module.css'

export function ProjectsRoute() {
  const { retry, state } = useProjectsList()
  const [detailCache] = useState<ProjectDetailCache>(() => new Map())
  const routeMotion = usePrimaryRouteMotion('projects')

  const completeRouteMotion = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return
    routeMotion.complete()
  }

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
        <div
          className={styles.contentReveal}
          onAnimationEnd={completeRouteMotion}
        >
          <Outlet
            context={{
              detailCache,
              projectsState: state,
              retryProjects: retry,
            } satisfies ProjectsRouteContextValue}
          />
        </div>
      </div>
    </section>
  )
}
