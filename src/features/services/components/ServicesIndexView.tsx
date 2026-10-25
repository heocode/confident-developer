import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

import backIconUrl from '../../../assets/icons/actions/services-back.svg'
import { useServicePointerPreview } from '../hooks/useServicePointerPreview.ts'
import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'
import { serviceMobileWidths } from '../presentation/service-tone-themes.ts'
import {
  toServiceTransitionRect,
} from '../routes/service-route-motion.ts'
import type { ServiceOpeningRequest } from '../routes/service-route-motion.ts'
import styles from './ServicesIndexView.module.css'

interface ServicesIndexViewProps {
  onOpenService: (request: ServiceOpeningRequest) => boolean
  services: ServiceSummaryPresentation[]
}

type ServiceSurfaceStyle = CSSProperties & {
  '--mobile-service-width': string
  '--service-tone-color': string
}

export function ServicesIndexView({ onOpenService, services }: ServicesIndexViewProps) {
  const [openingServiceId, setOpeningServiceId] = useState<string | null>(null)
  const listRef = useServicePointerPreview(openingServiceId !== null)

  const beginOpening = (
    event: MouseEvent<HTMLAnchorElement>,
    service: ServiceSummaryPresentation,
  ) => {
    if (
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return
    }

    if (openingServiceId) {
      event.preventDefault()
      return
    }

    const usesFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (min-width: 48.0625rem)',
    ).matches
    const usesKeyboard = event.detail === 0
    const usesDesktopLayout = window.matchMedia('(min-width: 48.0625rem)').matches
    if (!usesFinePointer && !(usesKeyboard && usesDesktopLayout)) return

    const action = event.currentTarget.querySelector<HTMLElement>(
      '[data-service-preview-action]',
    )
    const surface = event.currentTarget.querySelector<HTMLElement>(
      '[data-service-preview-surface]',
    )
    if (!action || !surface) return

    event.preventDefault()
    const openingStarted = onOpenService({
      actionRect: toServiceTransitionRect(action.getBoundingClientRect()),
      service,
      surfaceRect: toServiceTransitionRect(surface.getBoundingClientRect()),
    })

    if (openingStarted) setOpeningServiceId(service.id)
  }

  return (
    <ul
      aria-busy={openingServiceId !== null}
      aria-label="Published Services"
      className={styles.list}
      data-opening={openingServiceId ? '' : undefined}
      ref={listRef}
    >
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
              onClick={(event) => beginOpening(event, service)}
              to={`/services/${service.slug}`}
            >
              <span
                className={styles.surface}
                data-service-preview-surface=""
                style={surfaceStyle}
              >
                <span className={styles.title} data-service-preview-title="">
                  {service.title}
                </span>
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
