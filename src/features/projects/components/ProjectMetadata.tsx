import type { SelectedProjectPresentation } from '../presentation/projects-page.ts'
import { ProjectLinks } from './ProjectLinks.tsx'
import styles from './ProjectMetadata.module.css'

interface ProjectMetadataProps {
  project: SelectedProjectPresentation
}

export function ProjectMetadata({ project }: ProjectMetadataProps) {
  return (
    <aside className={styles.metadataSlide} aria-label={`${project.title} project details`}>
      <div className={styles.mobileCanvasViewport}>
        <div className={styles.metadata}>
          <section className={styles.scope}>
            <h2>Scope</h2>
            <p>{project.scope}</p>
          </section>

          <dl className={styles.facts}>
            <div>
              <dt>Position</dt>
              <dd>{project.position}</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>{project.timeline}</dd>
            </div>
          </dl>

          {project.links.length > 0 && (
            <section className={styles.linksSection} aria-labelledby="project-links-title">
              <h2 id="project-links-title">Links</h2>
              <ProjectLinks isInteractive links={project.links} variant="browser" />
            </section>
          )}
        </div>
      </div>
    </aside>
  )
}
