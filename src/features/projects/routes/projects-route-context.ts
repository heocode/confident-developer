import { useOutletContext } from 'react-router-dom'

import type { ProjectDetailCache } from '../hooks/useProjectsPageData.ts'
import type { ProjectsListState } from '../presentation/projects-page-state.ts'

export interface ProjectsRouteContextValue {
  detailCache: ProjectDetailCache
  projectsState: ProjectsListState
  retryProjects: () => void
}

export function useProjectsRouteContext() {
  return useOutletContext<ProjectsRouteContextValue>()
}
