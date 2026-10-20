import { useParams } from 'react-router-dom'

import { useProjectDetail } from '../hooks/useProjectsPageData.ts'
import { resolveProjectRouteState } from '../presentation/projects-page-state.ts'
import { useProjectsRouteContext } from './projects-route-context.ts'

export function ProjectDetailRoute() {
  const { slug } = useParams()

  if (!slug) return <p role="alert">Project not found.</p>

  return <ProjectDetailContent slug={slug} />
}

function ProjectDetailContent({ slug }: { slug: string }) {
  const { detailCache, projectsState, retryProjects } = useProjectsRouteContext()
  const { retry: retryDetail, state: detailState } = useProjectDetail(slug, detailCache)
  const state = resolveProjectRouteState(slug, projectsState, detailState)

  if (state.status === 'projects-loading') return <p role="status">Loading projects…</p>

  if (state.status === 'projects-error') {
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

  if (state.status === 'not-found') {
    return (
      <div role="alert">
        <p>Project “{state.slug}” was not found.</p>
      </div>
    )
  }

  if (state.status === 'detail-loading') {
    return <p role="status">Loading project…</p>
  }

  if (state.status === 'detail-error') {
    return (
      <div role="alert">
        <p>{state.message}</p>
        <button type="button" onClick={retryDetail}>
          Retry
        </button>
      </div>
    )
  }

  if (state.status === 'configuration-error') {
    return (
      <p role="alert">
        Project “{state.issue.projectSlug}” is unavailable because its published content is incomplete.
      </p>
    )
  }

  const project = state.presentation.selectedProject

  return (
    <p>
      Project data ready: <strong>{project?.title}</strong>
    </p>
  )
}
