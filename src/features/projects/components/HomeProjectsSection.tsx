import styles from './HomeProjectsSection.module.css'
import { useHomeProjects } from '../hooks/useHomeProjects.ts'

export function HomeProjectsSection() {
  const { retry, state } = useHomeProjects()

  return (
    <section className={styles.section} id="home-projects" aria-labelledby="home-projects-title">
      <header className={styles.header}>
        <h2 id="home-projects-title">HERE’S THE STUFF</h2>
        <p>some are still in progress...</p>
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
              <article>
                <h3>{project.title}</h3>
                <p>{project.tagline}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
