import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useProjectsList } from '../hooks/useProjectsPageData.ts'
import type { ProjectDetailCache } from '../hooks/useProjectsPageData.ts'
import type { ProjectsRouteContextValue } from './projects-route-context.ts'
import styles from './ProjectsRoute.module.css'

export function ProjectsRoute() {
  const { retry, state } = useProjectsList()
  const [detailCache] = useState<ProjectDetailCache>(() => new Map())

  return (
    <section className={styles.page} aria-labelledby="projects-title">
      <h1 className={styles.title} id="projects-title">
        THE STUFF ARCHIVE
      </h1>
      <div className={styles.content}>
        <Outlet
          context={{
            detailCache,
            projectsState: state,
            retryProjects: retry,
          } satisfies ProjectsRouteContextValue}
        />
      </div>
    </section>
  )
}
