import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useServicesList } from '../hooks/useServicesPageData.ts'
import type { ServiceDetailCache } from '../hooks/useServicesPageData.ts'
import type { ServicesRouteContextValue } from './services-route-context.ts'
import styles from './ServicesRoute.module.css'

export function ServicesRoute() {
  const { retry, state } = useServicesList()
  const [detailCache] = useState<ServiceDetailCache>(() => new Map())

  return (
    <section className={styles.page} aria-labelledby="services-title">
      <header className={styles.header}>
        <h1 className={styles.title} id="services-title">
          HOW I BUILD STUFF
        </h1>
      </header>
      <div className={styles.content}>
        <Outlet
          context={{
            detailCache,
            servicesState: state,
            retryServices: retry,
          } satisfies ServicesRouteContextValue}
        />
      </div>
    </section>
  )
}
