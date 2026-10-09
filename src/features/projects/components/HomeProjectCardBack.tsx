import type { CSSProperties } from 'react'

import type { PublicProject } from '../model/project.types.ts'
import { formatProjectTimeline } from '../presentation/project-formatters.ts'
import styles from './HomeProjectCard.module.css'
import { ProjectLinks } from './ProjectLinks.tsx'

interface BreakdownStyle extends CSSProperties {
  '--breakdown-percentage': string
}

interface HomeProjectCardBackProps {
  isVisible: boolean
  project: PublicProject
}

export function HomeProjectCardBack({ isVisible, project }: HomeProjectCardBackProps) {
  return (
    <div className={`${styles.face} ${styles.back}`} aria-hidden={!isVisible}>
      <header className={styles.backHeader}>
        <img
          className={styles.backLogo}
          src={project.logo.url}
          alt={project.logo.alt}
          width={project.logo.width}
          height={project.logo.height}
        />
        <div className={styles.backIdentity}>
          <h3>{project.title}</h3>
          <p>{project.position}</p>
          <time>{formatProjectTimeline(project.timeline)}</time>
        </div>
      </header>

      <p className={styles.summary}>{project.summary}</p>

      {project.buildBreakdown.length > 0 && (
        <section className={styles.breakdown} aria-label={`${project.title} build breakdown`}>
          <h4>BUILD BREAKDOWN</h4>
          <ul>
            {project.buildBreakdown.map((item) => {
              const percentage = Math.min(100, Math.max(0, item.percentage))
              const breakdownStyle: BreakdownStyle = {
                '--breakdown-percentage': `${percentage}%`,
              }

              return (
                <li key={item.id}>
                  <div className={styles.breakdownLabel}>
                    <span>{item.label}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div
                    className={styles.breakdownTrack}
                    role="progressbar"
                    aria-label={item.label}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage}
                  >
                    <span style={breakdownStyle} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <ProjectLinks isInteractive={isVisible} links={project.links} />
    </div>
  )
}
