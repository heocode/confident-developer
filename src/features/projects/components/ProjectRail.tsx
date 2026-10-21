import { useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'

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
  '--project-panel-expanded-aspect-ratio': number
  '--project-panel-expanded-base-width': string
}

const EXPANDED_SCREENSHOT_ASPECT_RATIO = 0.8

function ProjectScreenshot({
  index,
  screenshot,
}: {
  index: number
  screenshot: ProjectScreenshotPresentation
}) {
  const [hasFailed, setHasFailed] = useState(false)
  const isExpanded = screenshot.aspectRatio > EXPANDED_SCREENSHOT_ASPECT_RATIO
  const expandedPanelWidth = calculateExpandedProjectPanelWidth(screenshot.aspectRatio)
  const screenshotStyle: ProjectScreenshotStyle = {
    '--project-panel-expanded-aspect-ratio':
      expandedPanelWidth / PROJECT_RAIL_LAYOUT_TOKENS.baseHeight,
    '--project-panel-expanded-base-width': `${expandedPanelWidth}px`,
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
  const { layout, railRef } = useProjectRailLayout()
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

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        event.currentTarget.scrollBy({ left: -event.currentTarget.clientWidth * 0.8 })
        break
      case 'ArrowRight':
        event.preventDefault()
        event.currentTarget.scrollBy({ left: event.currentTarget.clientWidth * 0.8 })
        break
      case 'Home':
        event.preventDefault()
        event.currentTarget.scrollTo({ left: 0 })
        break
      case 'End':
        event.preventDefault()
        event.currentTarget.scrollTo({ left: event.currentTarget.scrollWidth })
        break
    }
  }

  return (
    <section
      aria-label={`${project.title} project content`}
      className={styles.rail}
      onKeyDown={handleKeyDown}
      ref={railRef}
      style={railStyle}
      tabIndex={0}
    >
      <ol className={styles.track}>
        {project.screenshots.map((screenshot, index) => (
          <ProjectScreenshot index={index} key={screenshot.id} screenshot={screenshot} />
        ))}
        <li className={`${styles.slide} ${styles.metadataSlide}`}>
          <div className={styles.canvasViewport}>
            <ProjectMetadata project={project} />
          </div>
        </li>
      </ol>
    </section>
  )
}
