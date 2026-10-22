import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'
import { serviceMobileWidths } from '../presentation/service-tone-themes.ts'
import styles from './ServicesIndexView.module.css'

interface ServicesIndexViewProps {
  services: ServiceSummaryPresentation[]
}

type ServiceSurfaceStyle = CSSProperties & {
  '--mobile-service-width': string
  '--service-tone-color': string
}

export function ServicesIndexView({ services }: ServicesIndexViewProps) {
  return (
    <ul className={styles.list} aria-label="Published Services">
      {services.map((service) => {
        const surfaceStyle: ServiceSurfaceStyle = {
          '--mobile-service-width': serviceMobileWidths[service.tone.key],
          '--service-tone-color': service.tone.color,
        }

        return (
          <li className={styles.item} key={service.id}>
            <Link
              aria-label={`View ${service.title} details`}
              className={styles.link}
              to={`/services/${service.slug}`}
            >
              <span className={styles.surface} style={surfaceStyle}>
                <span className={styles.title}>{service.title}</span>
                <img
                  alt=""
                  className={styles.icon}
                  height={service.icon.height}
                  src={service.icon.src}
                  width={service.icon.width}
                />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
