import { useState } from 'react'
import type { CSSProperties } from 'react'

import { HorizontalSnapRail } from '../../../components/scroll/HorizontalSnapRail.tsx'
import { useProjectRailLayout } from '../hooks/useProjectRailLayout.ts'
import {
  calculateExpandedProjectPanelWidth,
  PROJECT_RAIL_LAYOUT_TOKENS,
} from '../presentation/project-rail-layout.ts'
import type {
  ProjectScreenshotPresentation,
  SelectedProjectPresentation,
} from '../presentation/projects-page.ts'
import { ProjectMetadata } from './ProjectMetadata.tsx'
import styles from './ProjectRail.module.css'

interface ProjectRailProps {
  project: SelectedProjectPresentation
}

type ProjectRailStyle = CSSProperties & {
  '--project-panel-base-height': string
  '--project-panel-base-width': string
  '--project-panel-height'?: string
  '--project-panel-scale'?: number
  '--project-panel-width'?: string
}

type ProjectScreenshotStyle = CSSProperties & {
  '--project-panel-surface-base-width': string
  '--project-slide-width': string
}

const EXPANDED_SCREENSHOT_ASPECT_RATIO = 0.8

function ProjectScreenshot({
  index,
  layoutBaseWidth,
  layoutWidth,
  screenshot,
}: {
  index: number
  layoutBaseWidth?: number
  layoutWidth?: number
  screenshot: ProjectScreenshotPresentation
}) {
  const [hasFailed, setHasFailed] = useState(false)
  const isExpanded = screenshot.aspectRatio > EXPANDED_SCREENSHOT_ASPECT_RATIO
  const expandedPanelWidth = calculateExpandedProjectPanelWidth(screenshot.aspectRatio)
  const screenshotStyle: ProjectScreenshotStyle = {
    '--project-panel-surface-base-width': `${layoutBaseWidth ?? expandedPanelWidth}px`,
    '--project-slide-width': `${layoutWidth ?? expandedPanelWidth}px`,
  }

  return (
    <li
      className={isExpanded ? `${styles.slide} ${styles.expandedSlide}` : styles.slide}
      style={screenshotStyle}
    >
      <div className={styles.canvasViewport}>
        <div className={styles.screenshotPanel}>
          {hasFailed ? (
            <p className={styles.imageError} role="status">
              Screenshot unavailable
            </p>
          ) : (
            <img
              alt={screenshot.alt}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              height={screenshot.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={() => setHasFailed(true)}
              src={screenshot.url}
              style={{ aspectRatio: screenshot.aspectRatio }}
              width={screenshot.width}
            />
          )}
        </div>
      </div>
    </li>
  )
}

export function ProjectRail({ project }: ProjectRailProps) {
  const { layout, railRef } = useProjectRailLayout(project.screenshots)
  const railStyle: ProjectRailStyle = {
    '--project-panel-base-height': `${PROJECT_RAIL_LAYOUT_TOKENS.baseHeight}px`,
    '--project-panel-base-width': `${PROJECT_RAIL_LAYOUT_TOKENS.baseWidth}px`,
    ...(layout
      ? {
          '--project-panel-height': `${layout.height}px`,
          '--project-panel-scale': layout.scale,
          '--project-panel-width': `${layout.width}px`,
        }
      : {}),
  }

  return (
    <HorizontalSnapRail
      aria-label={`${project.title} project content`}
      className={styles.rail}
      ref={railRef}
      resetKey={project.slug}
      style={railStyle}
    >
      <ol className={styles.track}>
        {project.screenshots.map((screenshot, index) => (
          <ProjectScreenshot
            index={index}
            key={screenshot.id}
            layoutBaseWidth={layout?.screenshotBaseWidths[index]}
            layoutWidth={layout?.screenshotWidths[index]}
            screenshot={screenshot}
          />
        ))}
        <li className={`${styles.slide} ${styles.metadataSlide}`}>
          <div className={styles.canvasViewport}>
            <ProjectMetadata project={project} />
          </div>
        </li>
      </ol>
    </HorizontalSnapRail>
  )
}
