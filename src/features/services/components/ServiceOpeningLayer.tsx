import type { CSSProperties } from 'react'

import backIconUrl from '../../../assets/icons/actions/services-back.svg'
import type {
  ServiceClosingState,
  ServiceOpeningState,
} from '../routes/service-route-motion.ts'
import styles from './ServiceOpeningLayer.module.css'

interface ServiceOpeningLayerProps {
  direction?: 'closing' | 'opening'
  transition: ServiceClosingState | ServiceOpeningState
}

type OpeningLayerStyle = CSSProperties & {
  '--service-opening-action-inset': string
  '--service-opening-bottom': string
  '--service-opening-left': string
  '--service-opening-radius': string
  '--service-opening-right': string
  '--service-opening-top': string
  '--service-tone-color': string
}

export function ServiceOpeningLayer({
  direction = 'opening',
  transition,
}: ServiceOpeningLayerProps) {
  const { geometry, service } = transition
  const actionInset = geometry
    ? Math.max(
        0,
        geometry.surfaceRect.left +
          geometry.surfaceRect.width -
          geometry.actionRect.left -
          geometry.actionRect.width,
      )
    : 0

  const layerStyle: OpeningLayerStyle = {
    '--service-opening-action-inset': geometry
      ? `${actionInset}px`
      : 'var(--services-row-inline-start)',
    '--service-opening-bottom': geometry
      ? `calc(100% - ${geometry.surfaceRect.top + geometry.surfaceRect.height}px)`
      : '0px',
    '--service-opening-left': geometry ? `${geometry.surfaceRect.left}px` : '0px',
    '--service-opening-radius': geometry
      ? `${geometry.surfaceRect.height / 2}px`
      : '0px',
    '--service-opening-right': geometry
      ? `calc(100% - ${geometry.surfaceRect.left + geometry.surfaceRect.width}px)`
      : '0px',
    '--service-opening-top': geometry ? `${geometry.surfaceRect.top}px` : '0px',
    '--service-tone-color': service.tone.color,
  }

  return (
    <div
      aria-hidden="true"
      className={styles.layer}
      data-direction={direction}
      data-phase={transition.phase}
      style={layerStyle}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <h2 className={styles.title}>{service.title}</h2>
          <img
            alt=""
            className={styles.serviceIcon}
            height={service.icon.height}
            src={service.icon.src}
            width={service.icon.width}
          />
        </div>
        <span className={styles.action}>
          <img alt="" height="84" src={backIconUrl} width="84" />
        </span>
      </header>
    </div>
  )
}
