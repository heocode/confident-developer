import { Link } from 'react-router-dom'
import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

import backIconUrl from '../../../assets/icons/actions/services-back.svg'
import { useServicePointerPreview } from '../hooks/useServicePointerPreview.ts'
import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'
import { serviceMobileWidths } from '../presentation/service-tone-themes.ts'
import {
  shouldAnimateServiceTransition,
  toServiceTransitionRect,
} from '../routes/service-route-motion.ts'
import type { ServiceOpeningRequest } from '../routes/service-route-motion.ts'
import styles from './ServicesIndexView.module.css'

interface ServicesIndexViewProps {
  closingServiceSlug: string | null
  onClosingTargetReady: (request: ServiceOpeningRequest) => void
  onOpenService: (request: ServiceOpeningRequest) => boolean
  services: ServiceSummaryPresentation[]
}

type ServiceSurfaceStyle = CSSProperties & {
  '--mobile-service-width': string
  '--service-tone-color': string
}

export function ServicesIndexView({
  closingServiceSlug,
  onClosingTargetReady,
  onOpenService,
  services,
}: ServicesIndexViewProps) {
  const [openingServiceId, setOpeningServiceId] = useState<string | null>(null)
  const listRef = useServicePointerPreview(
    openingServiceId !== null || closingServiceSlug !== null,
  )

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !closingServiceSlug) return

    const service = services.find(({ slug }) => slug === closingServiceSlug)
    const item = Array.from(
      list.querySelectorAll<HTMLElement>('[data-service-preview-item]'),
    ).find(({ dataset }) => dataset.serviceSlug === closingServiceSlug)
    const action = item?.querySelector<HTMLElement>('[data-service-preview-action]')
    const surface = item?.querySelector<HTMLElement>('[data-service-preview-surface]')
    if (!service || !action || !surface) return

    const surfaceRect = surface.getBoundingClientRect()
    const actionRect = action.getBoundingClientRect()
    const parsedActionInset = Number.parseFloat(
      window
        .getComputedStyle(action)
        .getPropertyValue('--service-preview-action-inset'),
    )
    const actionInset = Number.isFinite(parsedActionInset) ? parsedActionInset : 0

    onClosingTargetReady({
      actionRect: {
        height: actionRect.height,
        left:
          surfaceRect.right - actionInset - actionRect.width,
        top: surfaceRect.top + (surfaceRect.height - actionRect.height) / 2,
        width: actionRect.width,
      },
      service,
      surfaceRect: toServiceTransitionRect(surfaceRect),
    })
  }, [closingServiceSlug, listRef, onClosingTargetReady, services])

  const beginOpening = (
    event: MouseEvent<HTMLAnchorElement>,
    service: ServiceSummaryPresentation,
  ) => {
    if (!shouldAnimateServiceTransition(event)) return

    if (openingServiceId) {
      event.preventDefault()
      return
    }

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
          <li
            className={styles.item}
            data-service-preview-item=""
            data-service-slug={service.slug}
            key={service.id}
          >
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
