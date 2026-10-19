export interface PublicMedia {
  id: string
  url: string
  alt: string
  width: number
  height: number
}

export type ProjectLinkIcon = 'github' | 'website' | 'app-store' | 'external'

export interface ProjectLink {
  id: string
  label: string
  url: string
  icon: ProjectLinkIcon
}

export interface BuildBreakdownItem {
  id: string
  label: string
  percentage: number
}

export interface ProjectsPageTheme {
  tabColor: string
  panelColor: string
}

export interface PublicProject {
  id: string
  slug: string
  title: string
  tagline: string
  summary: string
  position: string
  themeColor: string | null
  projectsPageTheme: ProjectsPageTheme | null
  timeline: {
    startDate: string
    endDate: string | null
  }
  home: {
    featured: boolean
    primary: boolean
  }
  buildBreakdown: BuildBreakdownItem[]
  logo: PublicMedia
  homePreview: PublicMedia | null
  links: ProjectLink[]
}

export interface PublicProjectDetail extends PublicProject {
  scope: string
  screenshots: PublicMedia[]
}
