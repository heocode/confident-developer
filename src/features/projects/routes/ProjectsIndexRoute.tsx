import { Navigate } from 'react-router-dom'

import { resolveProjectsIndexState } from '../presentation/projects-page-state.ts'
import { useProjectsRouteContext } from './projects-route-context.ts'

export function ProjectsIndexRoute() {
  const { projectsState, retryProjects } = useProjectsRouteContext()
  const state = resolveProjectsIndexState(projectsState)

  if (state.status === 'loading') return <p role="status">Loading projects…</p>

  if (state.status === 'error') {
    return (
      <div role="alert">
        <p>{state.message}</p>
        <button type="button" onClick={retryProjects}>
          Retry
        </button>
      </div>
    )
  }

  if (state.status === 'empty') return <p>No published projects are available yet.</p>

  return <Navigate to={`/projects/${state.slug}`} replace />
}
