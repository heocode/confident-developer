import { Navigate } from 'react-router-dom'

import { ProjectsPageFeedback } from '../components/ProjectsPageFeedback.tsx'
import { resolveProjectsIndexState } from '../presentation/projects-page-state.ts'
import { useProjectsRouteContext } from './projects-route-context.ts'

export function ProjectsIndexRoute() {
  const { projectsState, retryProjects } = useProjectsRouteContext()
  const state = resolveProjectsIndexState(projectsState)

  if (state.status === 'loading') {
    return <ProjectsPageFeedback title="Loading projects" message="Preparing the project archive…" />
  }

  if (state.status === 'error') {
    return (
      <ProjectsPageFeedback
        isError
        title="Projects unavailable"
        message={state.message}
        onRetry={retryProjects}
      />
    )
  }

  if (state.status === 'empty') {
    return (
      <ProjectsPageFeedback
        title="No published projects"
        message="The project archive is being prepared. Please check back soon."
      />
    )
  }

  return <Navigate to={`/projects/${state.slug}`} replace />
}
