import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

import backIconUrl from '../../../assets/icons/actions/services-back.svg'
import type { SelectedServicePresentation } from '../presentation/services-page.ts'
import { ServiceShowcaseRail } from './ServiceShowcaseRail.tsx'
import styles from './ServiceDetailView.module.css'

interface ServiceDetailViewProps {
  service: SelectedServicePresentation
}

type ServiceDetailStyle = CSSProperties & {
  '--service-surface-color': string
  '--service-tone-color': string
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  const detailStyle: ServiceDetailStyle = {
    '--service-surface-color': service.tone.surfaceColor,
    '--service-tone-color': service.tone.color,
  }

  return (
    <article
      aria-labelledby={`service-${service.slug}-title`}
      className={styles.detail}
      style={detailStyle}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <h2 className={styles.title} id={`service-${service.slug}-title`}>
            {service.title}
          </h2>
          <img
            alt=""
            className={styles.serviceIcon}
            height={service.icon.height}
            src={service.icon.src}
            width={service.icon.width}
          />
        </div>
        <Link aria-label="Back to Services" className={styles.backLink} to="/services">
          <img alt="" height="84" src={backIconUrl} width="84" />
        </Link>
      </header>

      <div className={styles.body}>
        <ServiceShowcaseRail
          assets={service.showcaseAssets}
          serviceSlug={service.slug}
          serviceTitle={service.title}
        >
          <div
            aria-label={`${service.title} description and capabilities`}
            className={styles.primaryInformation}
            tabIndex={0}
          >
            <section
              className={`${styles.card} ${styles.descriptionCard}`}
              aria-labelledby={`${service.slug}-description`}
            >
              <h3 id={`${service.slug}-description`}>Description</h3>
              <p className={styles.description}>{service.description}</p>
            </section>

            <section
              className={`${styles.card} ${styles.capabilitiesCard}`}
              aria-labelledby={`${service.slug}-capabilities`}
            >
              <h3 id={`${service.slug}-capabilities`}>What I can help with</h3>
              <ul className={styles.capabilities}>
                {service.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className={styles.resourceGrid}>
            <section
              className={`${styles.card} ${styles.resourceCard}`}
              aria-labelledby={`${service.slug}-tools`}
            >
              <h3 id={`${service.slug}-tools`}>Tools</h3>
              <ul className={styles.resources}>
                {service.tools.map((tool) => (
                  <li className={styles.resource} key={tool.key}>
                    <img
                      alt={tool.label}
                      height={tool.icon.height}
                      src={tool.icon.src}
                      width={tool.icon.width}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={`${styles.card} ${styles.resourceCard}`}
              aria-labelledby={`${service.slug}-projects`}
            >
              <h3 id={`${service.slug}-projects`}>Used In</h3>
              <ul className={styles.resources}>
                {service.relatedProjects.map((project) => (
                  <li className={styles.resource} key={project.id}>
                    <Link
                      aria-label={`View ${project.title} project`}
                      className={styles.projectLink}
                      to={`/projects/${project.slug}`}
                    >
                      <img
                        alt={project.logo.alt}
                        height={project.logo.height}
                        loading="lazy"
                        src={project.logo.url}
                        width={project.logo.width}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ServiceShowcaseRail>
      </div>
    </article>
  )
}
