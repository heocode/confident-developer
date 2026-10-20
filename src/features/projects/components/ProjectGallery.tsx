import { useState } from 'react'
import type { CSSProperties } from 'react'

import type { ProjectScreenshotPresentation } from '../presentation/projects-page.ts'
import styles from './ProjectGallery.module.css'

interface ProjectGalleryProps {
  projectTitle: string
  screenshots: ProjectScreenshotPresentation[]
}

type GalleryStyle = CSSProperties & { '--gallery-count': number }

function ProjectScreenshot({
  index,
  screenshot,
}: {
  index: number
  screenshot: ProjectScreenshotPresentation
}) {
  const [hasFailed, setHasFailed] = useState(false)

  return (
    <li className={styles.slide}>
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

  return (
    <section className={styles.galleryRegion} aria-label={`${projectTitle} screenshots`}>
      <ul
        className={hasOverflow ? `${styles.gallery} ${styles.overflow}` : styles.gallery}
        style={{ '--gallery-count': screenshots.length } as GalleryStyle}
      >
        {screenshots.map((screenshot, index) => (
          <ProjectScreenshot index={index} key={screenshot.id} screenshot={screenshot} />
        ))}
      </ul>
    </section>
  )
}
