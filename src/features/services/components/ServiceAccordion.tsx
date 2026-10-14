import { useState } from 'react'
import type { FocusEvent, MouseEvent, PointerEvent } from 'react'

import { useScrollAwareServiceHover } from '../hooks/useScrollAwareServiceHover.ts'
import type { HomeService, ServiceTone } from '../model/service.types.ts'
import styles from './HomeServicesSection.module.css'

const toneClassByTone: Record<ServiceTone, string> = {
  product: styles.product,
  mobile: styles.mobile,
  web: styles.web,
  backend: styles.backend,
}

interface ServiceAccordionProps {
  services: readonly HomeService[]
}

export function ServiceAccordion({ services }: ServiceAccordionProps) {
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null)
  const listRef = useScrollAwareServiceHover(setActiveServiceId)

  const activateFromPointer = (event: PointerEvent<HTMLButtonElement>, serviceId: string) => {
    if (event.pointerType !== 'touch') setActiveServiceId(serviceId)
  }

  const deactivateFromPointer = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'touch' && !event.currentTarget.contains(document.activeElement)) {
      setActiveServiceId(null)
    }
  }

  const deactivateAfterFocusLeaves = (event: FocusEvent<HTMLUListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setActiveServiceId(null)
  }

  const activateFromClick = (event: MouseEvent<HTMLButtonElement>, serviceId: string) => {
    const usesTouchInteraction = window.matchMedia('(hover: none), (pointer: coarse)').matches

    if (usesTouchInteraction || event.detail === 0) {
      setActiveServiceId((currentServiceId) =>
        currentServiceId === serviceId ? null : serviceId,
      )
      return
    }

    setActiveServiceId(serviceId)
  }

  const activateFromFocus = (event: FocusEvent<HTMLButtonElement>, serviceId: string) => {
    if (event.currentTarget.matches(':focus-visible')) setActiveServiceId(serviceId)
  }

  return (
    <ul
      className={styles.list}
      onBlur={deactivateAfterFocusLeaves}
      onPointerLeave={deactivateFromPointer}
      ref={listRef}
    >
      {services.map((service) => {
        const isActive = service.id === activeServiceId
        const descriptionId = `home-service-${service.id}-description`

        return (
          <li
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            data-home-service-entrance-item=""
            key={service.id}
          >
            <button
              className={styles.trigger}
              type="button"
              aria-controls={descriptionId}
              aria-describedby={isActive ? descriptionId : undefined}
              aria-expanded={isActive}
              data-service-id={service.id}
              onClick={(event) => activateFromClick(event, service.id)}
              onFocus={(event) => activateFromFocus(event, service.id)}
              onPointerEnter={(event) => activateFromPointer(event, service.id)}
            >
              <span className={`${styles.surface} ${toneClassByTone[service.tone]}`}>
                <span className={styles.lead}>
                  <span className={styles.title}>{service.title}</span>
                  <img
                    className={styles.icon}
                    src={service.icon.src}
                    alt=""
                    width={service.icon.width}
                    height={service.icon.height}
                  />
                </span>
                <span
                  className={styles.description}
                  id={descriptionId}
                  aria-hidden={!isActive}
                >
                  <span className={styles.descriptionText}>{service.description}</span>
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
