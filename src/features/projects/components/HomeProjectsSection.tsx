import type { FocusEvent, Ref } from 'react'

import styles from './HomeProjectsSection.module.css'
import { HomeProjectCard } from './HomeProjectCard.tsx'
import { useHomeProjects } from '../hooks/useHomeProjects.ts'

interface HomeProjectsSectionProps {
  sectionRef?: Ref<HTMLElement>
}

export function HomeProjectsSection({ sectionRef }: HomeProjectsSectionProps) {
  const { retry, state } = useHomeProjects()

  const revealForKeyboardFocus = (event: FocusEvent<HTMLElement>) => {
    if (!event.target.matches(':focus-visible')) return
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return

    // Native focus scrolling can center a low card control beyond the section's exit phase.
    event.currentTarget.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'nearest' })
  }

  return (
    <section
      className={styles.section}
      id="home-projects"
      aria-labelledby="home-projects-title"
      onFocusCapture={revealForKeyboardFocus}
      ref={sectionRef}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 id="home-projects-title">HERE’S THE STUFF</h2>
          <p>some are still in progress...</p>
        </div>
      </header>

      {state.status === 'loading' && (
        <div className={styles.state} role="status" aria-live="polite">
          <p>Loading featured projects…</p>
        </div>
      )}

      {state.status === 'empty' && (
        <div className={styles.state}>
          <h3>No featured projects yet</h3>
          <p>Published projects will appear here when they become available.</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className={styles.state} role="alert">
          <h3>Projects are unavailable</h3>
          <p>{state.message}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <ul className={styles.projectList} aria-label="Featured projects">
          {state.projects.map((project) => (
            <li
              className={styles.projectSlot}
              data-primary={project.id === state.primaryProjectId || undefined}
              key={project.id}
            >
              <HomeProjectCard isPrimary={project.id === state.primaryProjectId} project={project} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
