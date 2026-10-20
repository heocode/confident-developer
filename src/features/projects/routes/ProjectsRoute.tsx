import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useProjectsList } from '../hooks/useProjectsPageData.ts'
import type { ProjectDetailCache } from '../hooks/useProjectsPageData.ts'
import type { ProjectsRouteContextValue } from './projects-route-context.ts'

export function ProjectsRoute() {
  const { retry, state } = useProjectsList()
  const [detailCache] = useState<ProjectDetailCache>(() => new Map())

  return (
    <section className="route-page" aria-labelledby="projects-title">
      <p className="route-page__eyebrow">Projects</p>
      <h1 id="projects-title">THE STUFF ARCHIVE</h1>
      <Outlet
        context={{
          detailCache,
          projectsState: state,
          retryProjects: retry,
        } satisfies ProjectsRouteContextValue}
      />
    </section>
  )
}
