import type { CSSProperties } from 'react'

import backIconUrl from '../../../assets/icons/actions/services-back.svg'
import type { ServiceOpeningState } from '../routes/service-route-motion.ts'
import styles from './ServiceOpeningLayer.module.css'

interface ServiceOpeningLayerProps {
  transition: ServiceOpeningState
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

export function ServiceOpeningLayer({ transition }: ServiceOpeningLayerProps) {
  const { geometry, service } = transition
  const actionInset = Math.max(
    0,
    geometry.surfaceRect.left +
      geometry.surfaceRect.width -
      geometry.actionRect.left -
      geometry.actionRect.width,
  )

  const layerStyle: OpeningLayerStyle = {
    '--service-opening-action-inset': `${actionInset}px`,
    '--service-opening-bottom': `calc(100% - ${geometry.surfaceRect.top + geometry.surfaceRect.height}px)`,
    '--service-opening-left': `${geometry.surfaceRect.left}px`,
    '--service-opening-radius': `${geometry.surfaceRect.height / 2}px`,
    '--service-opening-right': `calc(100% - ${geometry.surfaceRect.left + geometry.surfaceRect.width}px)`,
    '--service-opening-top': `${geometry.surfaceRect.top}px`,
    '--service-tone-color': service.tone.color,
  }

  return (
    <div
      aria-hidden="true"
      className={styles.layer}
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
