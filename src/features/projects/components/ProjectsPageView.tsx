import type { ProjectRouteState } from '../presentation/projects-page-state.ts'
import { createProjectBrowserShellPresentation } from '../presentation/projects-page.ts'
import { ProjectBrowser } from './ProjectBrowser.tsx'
import { ProjectGallery } from './ProjectGallery.tsx'
import { ProjectMetadata } from './ProjectMetadata.tsx'
import { ProjectsPageFeedback } from './ProjectsPageFeedback.tsx'
import styles from './ProjectsPageView.module.css'

interface ProjectsPageViewProps {
  onRetryDetail: () => void
  onRetryProjects: () => void
  state: ProjectRouteState
}

function feedbackForState(
  state: Exclude<ProjectRouteState, { status: 'ready' }>,
  onRetryDetail: () => void,
  onRetryProjects: () => void,
) {
  switch (state.status) {
    case 'projects-loading':
      return <ProjectsPageFeedback title="Loading projects" message="Preparing the project archive…" />
    case 'projects-error':
      return (
        <ProjectsPageFeedback
          isError
          title="Projects unavailable"
          message={state.message}
          onRetry={onRetryProjects}
        />
      )
    case 'empty':
      return (
        <ProjectsPageFeedback
          title="No published projects"
          message="The project archive is being prepared. Please check back soon."
        />
      )
    case 'not-found':
      return (
        <ProjectsPageFeedback
          isError
          title="Project not found"
          message={`“${state.slug}” is not available in the published project archive.`}
        />
      )
    case 'detail-loading':
      return <ProjectsPageFeedback title="Loading project" message="Preparing project details and screenshots…" />
    case 'detail-error':
      return (
        <ProjectsPageFeedback
          isError
          title="Project unavailable"
          message={state.message}
          onRetry={onRetryDetail}
        />
      )
    case 'configuration-error':
      return (
        <ProjectsPageFeedback
          isError
          title="Project unavailable"
          message={`“${state.issue.projectSlug}” has incomplete published content.`}
        />
      )
  }
}

export function ProjectsPageView({ onRetryDetail, onRetryProjects, state }: ProjectsPageViewProps) {
  if (state.status === 'projects-loading' || state.status === 'projects-error' || state.status === 'empty') {
    return (
      <div className={styles.standaloneFeedback}>
        {feedbackForState(state, onRetryDetail, onRetryProjects)}
      </div>
    )
  }

  if (state.status === 'ready') {
    const project = state.presentation.selectedProject

    if (!project) {
      return (
        <div className={styles.standaloneFeedback}>
          <ProjectsPageFeedback
            isError
            title="Project unavailable"
            message="Published project data is incomplete."
          />
        </div>
      )
    }

    return (
      <ProjectBrowser
        activeSlug={project.slug}
        tabs={state.presentation.tabs}
        theme={project.theme}
      >
        <div className={styles.content}>
          <ProjectGallery projectTitle={project.title} screenshots={project.screenshots} />
          <ProjectMetadata project={project} />
        </div>
      </ProjectBrowser>
    )
  }

  const shell = createProjectBrowserShellPresentation(state.projects, state.status === 'configuration-error' ? state.issue.projectSlug : state.slug)

  return (
    <ProjectBrowser activeSlug={shell.activeSlug} tabs={shell.tabs} theme={shell.theme}>
      {feedbackForState(state, onRetryDetail, onRetryProjects)}
    </ProjectBrowser>
  )
}
