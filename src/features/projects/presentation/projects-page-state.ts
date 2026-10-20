import { ApiError } from '../../../api/api-error.ts'
import type { PublicProject, PublicProjectDetail } from '../model/project.types.ts'
import type {
  ProjectsPageConfigurationIssue,
  ProjectsPagePresentation,
} from './projects-page.ts'
import { createProjectsPagePresentation } from './projects-page.ts'

export type ProjectsListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; projects: PublicProject[] }

export type ProjectDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string; notFound: boolean }
  | { status: 'ready'; project: PublicProjectDetail }

export type ProjectsIndexState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'redirect'; slug: string }

export type ProjectRouteState =
  | { status: 'projects-loading' }
  | { status: 'projects-error'; message: string }
  | { status: 'empty' }
  | { status: 'not-found'; projects: PublicProject[]; slug: string }
  | { status: 'detail-loading'; projects: PublicProject[]; slug: string }
  | { status: 'detail-error'; projects: PublicProject[]; slug: string; message: string }
  | {
      status: 'configuration-error'
      projects: PublicProject[]
      issue: ProjectsPageConfigurationIssue
    }
  | { status: 'ready'; presentation: ProjectsPagePresentation }

export function getProjectsRequestErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Projects could not be loaded. Please try again.'

  if (error.kind === 'network') {
    return 'The projects service is unavailable right now. Please try again.'
  }

  if (error.kind === 'invalid-response') {
    return 'The projects service returned an unexpected response. Please try again.'
  }

  return error.message
}

export function isProjectNotFoundError(error: unknown) {
  return error instanceof ApiError && error.kind === 'http' && error.status === 404
}

export function resolveProjectsIndexState(projectsState: ProjectsListState): ProjectsIndexState {
  if (projectsState.status !== 'ready') return projectsState
  if (projectsState.projects.length === 0) return { status: 'empty' }

  return { status: 'redirect', slug: projectsState.projects[0].slug }
}

export function resolveProjectRouteState(
  slug: string,
  projectsState: ProjectsListState,
  detailState: ProjectDetailState,
): ProjectRouteState {
  if (projectsState.status === 'loading') return { status: 'projects-loading' }
  if (projectsState.status === 'error') {
    return { status: 'projects-error', message: projectsState.message }
  }
  if (projectsState.projects.length === 0) return { status: 'empty' }

  if (!projectsState.projects.some((project) => project.slug === slug)) {
    return { status: 'not-found', projects: projectsState.projects, slug }
  }

  if (detailState.status === 'loading') {
    return { status: 'detail-loading', projects: projectsState.projects, slug }
  }
  if (detailState.status === 'error') {
    return detailState.notFound
      ? { status: 'not-found', projects: projectsState.projects, slug }
      : {
          status: 'detail-error',
          projects: projectsState.projects,
          slug,
          message: detailState.message,
        }
  }

  const presentation = createProjectsPagePresentation(projectsState.projects, detailState.project)

  if (!presentation) return { status: 'empty' }
  if (presentation.configurationIssue) {
    return {
      status: 'configuration-error',
      projects: projectsState.projects,
      issue: presentation.configurationIssue,
    }
  }

  return { status: 'ready', presentation }
}
