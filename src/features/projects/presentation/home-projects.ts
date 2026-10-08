import type { PublicProject } from '../model/project.types.ts'

export type HomeProjectsConfigurationIssue = 'missing-primary' | 'multiple-primary'

export interface HomeProjectsPresentation {
  configurationIssue: HomeProjectsConfigurationIssue | null
  primaryProjectId: string
  projects: PublicProject[]
}

export function createHomeProjectsPresentation(projects: PublicProject[]): HomeProjectsPresentation | null {
  if (projects.length === 0) return null

  const primaryProjects = projects.filter((project) => project.home.primary)

  return {
    configurationIssue:
      primaryProjects.length === 0
        ? 'missing-primary'
        : primaryProjects.length > 1
          ? 'multiple-primary'
          : null,
    primaryProjectId: primaryProjects[0]?.id ?? projects[0].id,
    projects,
  }
}
