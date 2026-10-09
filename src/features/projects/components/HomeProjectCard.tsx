import { useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

import flipIconUrl from '../../../assets/icons/actions/flip.svg'
import type { PublicProject } from '../model/project.types.ts'
import { HomeProjectCardBack } from './HomeProjectCardBack.tsx'
import styles from './HomeProjectCard.module.css'

interface ProjectCardStyle extends CSSProperties {
  '--project-theme-color'?: string
}

interface HomeProjectCardProps {
  isPrimary: boolean
  project: PublicProject
}

export function HomeProjectCard({ isPrimary, project }: HomeProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardStyle: ProjectCardStyle = {
    '--project-theme-color': project.themeColor ?? undefined,
  }

  const toggleCard = () => setIsFlipped((currentState) => !currentState)

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest('a, button')) return
    toggleCard()
  }

  return (
    <article
      className={`${styles.card} ${isPrimary ? styles.primary : ''} ${isFlipped ? styles.flipped : ''}`}
      style={cardStyle}
      onClick={handleCardClick}
    >
      <div className={styles.cardInner}>
        <div className={`${styles.face} ${styles.front}`} aria-hidden={isFlipped}>
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
        </div>

        <HomeProjectCardBack isVisible={isFlipped} project={project} />
      </div>

      <button
        className={styles.flipButton}
        type="button"
        aria-label={`${isFlipped ? 'Show preview for' : 'Show details for'} ${project.title}`}
        aria-pressed={isFlipped}
        onClick={toggleCard}
      >
        <img src={flipIconUrl} alt="" width="42" height="42" />
      </button>
    </article>
  )
}
