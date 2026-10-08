import type { CSSProperties } from 'react'

import type { PublicProject } from '../model/project.types.ts'
import styles from './HomeProjectCard.module.css'

interface ProjectCardStyle extends CSSProperties {
  '--project-theme-color'?: string
}

interface HomeProjectCardProps {
  isPrimary: boolean
  project: PublicProject
}

export function HomeProjectCard({ isPrimary, project }: HomeProjectCardProps) {
  const cardStyle: ProjectCardStyle = {
    '--project-theme-color': project.themeColor ?? undefined,
  }

  return (
    <article className={`${styles.card} ${isPrimary ? styles.primary : ''}`} style={cardStyle}>
      <img
        className={styles.logo}
        src={project.logo.url}
        alt={project.logo.alt}
        width={project.logo.width}
        height={project.logo.height}
      />

      <div className={styles.identity}>
        <h3>{project.title}</h3>
        <p>{project.tagline}</p>
      </div>

      <div className={styles.preview}>
        {project.homePreview ? (
          <img
            src={project.homePreview.url}
            alt={project.homePreview.alt}
            width={project.homePreview.width}
            height={project.homePreview.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <p className={styles.previewUnavailable}>Preview unavailable</p>
        )}
      </div>
    </article>
  )
}
