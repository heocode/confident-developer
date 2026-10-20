import type { CSSProperties, ReactNode } from 'react'

import type { ProjectsPageTheme } from '../model/project.types.ts'
import type { ProjectTabPresentation } from '../presentation/projects-page.ts'
import { ProjectTabs } from './ProjectTabs.tsx'
import styles from './ProjectBrowser.module.css'

interface ProjectBrowserProps {
  activeSlug: string | null
  children: ReactNode
  tabs: ProjectTabPresentation[]
  theme: ProjectsPageTheme | null
}

type BrowserStyle = CSSProperties & {
  '--project-panel-color'?: string
  '--project-tab-color'?: string
}

export function ProjectBrowser({ activeSlug, children, tabs, theme }: ProjectBrowserProps) {
  const browserStyle: BrowserStyle = theme
    ? {
        '--project-panel-color': theme.panelColor,
        '--project-tab-color': theme.tabColor,
      }
    : {}

  return (
    <div className={styles.browser} style={browserStyle}>
      <ProjectTabs activeSlug={activeSlug} tabs={tabs} />
      <div className={styles.frame}>
        <div
          aria-labelledby={activeSlug ? `project-tab-${activeSlug}` : undefined}
          className={styles.viewport}
          id="selected-project-panel"
          role="tabpanel"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
