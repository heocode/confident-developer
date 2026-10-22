import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

import backIconUrl from '../../../assets/icons/actions/services-back.svg'
import { useServicePointerPreview } from '../hooks/useServicePointerPreview.ts'
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
  const listRef = useServicePointerPreview()

  return (
    <ul className={styles.list} aria-label="Published Services" ref={listRef}>
      {services.map((service) => {
        const surfaceStyle: ServiceSurfaceStyle = {
          '--mobile-service-width': serviceMobileWidths[service.tone.key],
          '--service-tone-color': service.tone.color,
        }

        return (
          <li className={styles.item} data-service-preview-item="" key={service.id}>
            <Link
              aria-label={`View ${service.title} details`}
              className={styles.link}
              to={`/services/${service.slug}`}
            >
              <span
                className={styles.surface}
                data-service-preview-surface=""
                style={surfaceStyle}
              >
                <span className={styles.title}>{service.title}</span>
                <img
                  alt=""
                  className={styles.icon}
                  height={service.icon.height}
                  src={service.icon.src}
                  width={service.icon.width}
                />
              </span>
              <span
                aria-hidden="true"
                className={styles.forwardAction}
                data-service-preview-action=""
              >
                <img alt="" height="84" src={backIconUrl} width="84" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
