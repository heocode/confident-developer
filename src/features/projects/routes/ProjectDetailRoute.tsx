import { useParams } from 'react-router-dom'

import { ProjectsPageFeedback } from '../components/ProjectsPageFeedback.tsx'
import { ProjectsPageView } from '../components/ProjectsPageView.tsx'
import { useProjectDetail } from '../hooks/useProjectsPageData.ts'
import { resolveProjectRouteState } from '../presentation/projects-page-state.ts'
import { useProjectsRouteContext } from './projects-route-context.ts'

export function ProjectDetailRoute() {
  const { slug } = useParams()

  if (!slug) {
    return (
      <ProjectsPageFeedback
        isError
        title="Project not found"
        message="The requested project URL is invalid."
      />
    )
  }

  return <ProjectDetailContent slug={slug} />
}

function ProjectDetailContent({ slug }: { slug: string }) {
  const { detailCache, projectsState, retryProjects } = useProjectsRouteContext()
  const { retry: retryDetail, state: detailState } = useProjectDetail(slug, detailCache)
  const state = resolveProjectRouteState(slug, projectsState, detailState)

  return (
    <ProjectsPageView
      onRetryDetail={retryDetail}
      onRetryProjects={retryProjects}
      state={state}
    />
  )
}
