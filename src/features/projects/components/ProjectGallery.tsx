import { useState } from 'react'
import type { CSSProperties } from 'react'

import { useProjectGalleryLayout } from '../hooks/useProjectGalleryLayout.ts'
import type { ProjectScreenshotPresentation } from '../presentation/projects-page.ts'
import styles from './ProjectGallery.module.css'

interface ProjectGalleryProps {
  projectTitle: string
  screenshots: ProjectScreenshotPresentation[]
}

type ProjectScreenshotStyle = CSSProperties & {
  '--project-mobile-screenshot-aspect-ratio': number
}

const MOBILE_EXPANDED_SCREENSHOT_ASPECT_RATIO = 0.8

function createGalleryStyle(
  screenshots: ProjectScreenshotPresentation[],
  screenshotWidths?: number[],
): CSSProperties {
  return {
    gridTemplateColumns: screenshotWidths
      ? screenshotWidths.map((width) => `${width}px`).join(' ')
      : screenshots.map((screenshot) => `minmax(0, ${screenshot.layoutWeight}fr)`).join(' '),
  }
}

function ProjectScreenshot({
  index,
  screenshot,
}: {
  index: number
  screenshot: ProjectScreenshotPresentation
}) {
  const [hasFailed, setHasFailed] = useState(false)
  const isExpandedScreenshot =
    screenshot.aspectRatio > MOBILE_EXPANDED_SCREENSHOT_ASPECT_RATIO
  const screenshotStyle: ProjectScreenshotStyle = {
    '--project-mobile-screenshot-aspect-ratio': screenshot.aspectRatio,
  }

  return (
    <li
      className={
        isExpandedScreenshot ? `${styles.slide} ${styles.expandedSlide}` : styles.slide
      }
      style={screenshotStyle}
    >
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
    </li>
  )
}

export function ProjectGallery({ projectTitle, screenshots }: ProjectGalleryProps) {
  const hasOverflow = screenshots.length > 3
  const { galleryRef, isDesktop, layout } = useProjectGalleryLayout(screenshots, !hasOverflow)
  const usesDesktopOverflow = isDesktop && hasOverflow

  return (
    <section
      className={styles.galleryRegion}
      aria-label={`${projectTitle} screenshots`}
      ref={galleryRef}
      style={isDesktop && layout ? { width: layout.galleryWidth } : undefined}
    >
      <ul
        className={usesDesktopOverflow ? `${styles.gallery} ${styles.overflow}` : styles.gallery}
        style={
          isDesktop && !hasOverflow
            ? createGalleryStyle(screenshots, layout?.screenshotWidths)
            : undefined
        }
      >
        {screenshots.map((screenshot, index) => (
          <ProjectScreenshot index={index} key={screenshot.id} screenshot={screenshot} />
        ))}
      </ul>
    </section>
  )
}
