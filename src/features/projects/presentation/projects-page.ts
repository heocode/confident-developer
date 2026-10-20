import type {
  ProjectLink,
  ProjectsPageTheme,
  PublicMedia,
  PublicProject,
  PublicProjectDetail,
} from '../model/project.types.ts'
import { formatProjectTimeline } from './project-formatters.ts'

export type ProjectsPageConfigurationIssueCode =
  | 'detail-project-mismatch'
  | 'missing-projects-page-theme'
  | 'missing-screenshots'
  | 'invalid-media-dimensions'

export interface ProjectsPageConfigurationIssue {
  code: ProjectsPageConfigurationIssueCode
  projectSlug: string
  mediaId?: string
}

export interface ProjectScreenshotPresentation extends PublicMedia {
  aspectRatio: number
  layoutWeight: number
}

export interface ProjectTabMediaPresentation extends PublicMedia {
  aspectRatio: number | null
}

export interface ProjectTabPresentation {
  id: string
  slug: string
  title: string
  logo: ProjectTabMediaPresentation
  theme: ProjectsPageTheme | null
}

export interface SelectedProjectPresentation {
  id: string
  slug: string
  title: string
  scope: string
  position: string
  timeline: string
  theme: ProjectsPageTheme
  links: ProjectLink[]
  screenshots: ProjectScreenshotPresentation[]
}

export interface ProjectsPagePresentation {
  tabs: ProjectTabPresentation[]
  selectedProject: SelectedProjectPresentation | null
  configurationIssue: ProjectsPageConfigurationIssue | null
}

export interface ProjectBrowserShellPresentation {
  activeSlug: string | null
  tabs: ProjectTabPresentation[]
  theme: ProjectsPageTheme | null
}

const MIN_SCREENSHOT_LAYOUT_WEIGHT = 0.45
const MAX_SCREENSHOT_LAYOUT_WEIGHT = 1.8

function hasValidDimensions(media: PublicMedia) {
  return Number.isFinite(media.width) && media.width > 0 && Number.isFinite(media.height) && media.height > 0
}

function createScreenshotPresentation(media: PublicMedia): ProjectScreenshotPresentation {
  const aspectRatio = media.width / media.height

  return {
    ...media,
    aspectRatio,
    layoutWeight: Math.min(
      MAX_SCREENSHOT_LAYOUT_WEIGHT,
      Math.max(MIN_SCREENSHOT_LAYOUT_WEIGHT, aspectRatio),
    ),
  }
}

function createTabMediaPresentation(media: PublicMedia): ProjectTabMediaPresentation {
  return {
    ...media,
    aspectRatio: hasValidDimensions(media) ? media.width / media.height : null,
  }
}

function findInvalidLogo(projects: PublicProject[]) {
  return projects.find((project) => !hasValidDimensions(project.logo))
}

export function createProjectTabsPresentation(projects: PublicProject[]): ProjectTabPresentation[] {
  return projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    logo: createTabMediaPresentation(project.logo),
    theme: project.projectsPageTheme ? { ...project.projectsPageTheme } : null,
  }))
}

export function createProjectBrowserShellPresentation(
  projects: PublicProject[],
  activeSlug: string,
): ProjectBrowserShellPresentation {
  const activeProject = projects.find((project) => project.slug === activeSlug)

  return {
    activeSlug: activeProject?.slug ?? null,
    tabs: createProjectTabsPresentation(projects),
    theme: activeProject?.projectsPageTheme ? { ...activeProject.projectsPageTheme } : null,
  }
}

export function createProjectsPagePresentation(
  projects: PublicProject[],
  detail: PublicProjectDetail,
): ProjectsPagePresentation | null {
  if (projects.length === 0) return null

  const selectedListProject = projects.find((project) => project.slug === detail.slug)
  const invalidLogoProject = findInvalidLogo(projects)
  const tabs = createProjectTabsPresentation(projects)

  if (!selectedListProject || selectedListProject.id !== detail.id) {
    return {
      tabs,
      selectedProject: null,
      configurationIssue: {
        code: 'detail-project-mismatch',
        projectSlug: detail.slug,
      },
    }
  }

  if (invalidLogoProject) {
    return {
      tabs,
      selectedProject: null,
      configurationIssue: {
        code: 'invalid-media-dimensions',
        projectSlug: invalidLogoProject.slug,
        mediaId: invalidLogoProject.logo.id,
      },
    }
  }

  if (!detail.projectsPageTheme) {
    return {
      tabs,
      selectedProject: null,
      configurationIssue: {
        code: 'missing-projects-page-theme',
        projectSlug: detail.slug,
      },
    }
  }

  if (detail.screenshots.length === 0) {
    return {
      tabs,
      selectedProject: null,
      configurationIssue: {
        code: 'missing-screenshots',
        projectSlug: detail.slug,
      },
    }
  }

  const invalidScreenshot = detail.screenshots.find((screenshot) => !hasValidDimensions(screenshot))

  if (invalidScreenshot) {
    return {
      tabs,
      selectedProject: null,
      configurationIssue: {
        code: 'invalid-media-dimensions',
        projectSlug: detail.slug,
        mediaId: invalidScreenshot.id,
      },
    }
  }

  return {
    tabs,
    selectedProject: {
      id: detail.id,
      slug: detail.slug,
      title: detail.title,
      scope: detail.scope,
      position: detail.position,
      timeline: formatProjectTimeline(detail.timeline),
      theme: { ...detail.projectsPageTheme },
      links: detail.links.map((link) => ({ ...link })),
      screenshots: detail.screenshots.map(createScreenshotPresentation),
    },
    configurationIssue: null,
  }
}
